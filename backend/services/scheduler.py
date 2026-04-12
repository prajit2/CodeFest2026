"""
APScheduler jobs — ingests live data from OpenDataPhilly, SEPTA GTFS, and university scrapers.
"""
from apscheduler.schedulers.background import BackgroundScheduler
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def _webmercator_to_wgs84(x: float, y: float):
    """Convert Web Mercator (EPSG:3857) x/y to WGS-84 lat/lon."""
    import math
    lon = x / 20037508.342789244 * 180.0
    lat = math.degrees(2 * math.atan(math.exp(y / 20037508.342789244 * math.pi)) - math.pi / 2)
    return lat, lon


def ingest_open_data_philly():
    """Pull food banks, shelters, clinics from public OpenDataPhilly ArcGIS REST services."""
    import httpx
    import hashlib
    from datetime import datetime, timezone
    from database import SessionLocal
    from models import Resource

    # Only services confirmed publicly accessible (no token required).
    # Geometry is Web Mercator (x/y) — converted to WGS-84 via _webmercator_to_wgs84().
    SOURCES = [
        {
            # Philadelphia Department of Public Health community health centers
            "url": "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Health_Centers/FeatureServer/0/query",
            "default_category": "clinic",
            "name_field": "name",
            "address_field": "full_address",
            "phone_field": "phone",
            "lat_override": None,
            "lon_override": None,
        },
        {
            # Bus shelters repurposed as safe-space markers (shelter category)
            "url": "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/SheltersLocations_20251030_/FeatureServer/0/query",
            "default_category": "shelter",
            "name_field": "Site__Site_Name",
            "address_field": "Full_Address",
            "phone_field": None,
            "lat_override": "Lat",   # service provides pre-projected lat/lon in attrs
            "lon_override": "Long",
        },
    ]

    PARAMS = {"f": "json", "where": "1=1", "outFields": "*", "resultRecordCount": 2000}

    logger.info("[scheduler] ingest_open_data_philly — starting")
    db = SessionLocal()
    total = 0
    try:
        existing_ids = {r.id for r in db.query(Resource.id).all()}
        seen_ids = set()

        with httpx.Client(timeout=30.0) as client:
            for source in SOURCES:
                try:
                    resp = client.get(source["url"], params=PARAMS)
                    resp.raise_for_status()
                    data = resp.json()
                except httpx.HTTPError as e:
                    logger.warning(f"[scheduler] open_data_philly — fetch failed for {source['url']}: {e}")
                    continue

                for feature in data.get("features", []):
                    attrs = feature.get("attributes", {})
                    geom = feature.get("geometry", {})

                    # Prefer explicit lat/lon attributes when provided by the service
                    if source["lat_override"] and source["lon_override"]:
                        lat = attrs.get(source["lat_override"])
                        lon = attrs.get(source["lon_override"])
                    else:
                        raw_x = geom.get("x")
                        raw_y = geom.get("y")
                        if raw_x is None or raw_y is None:
                            continue
                        lat, lon = _webmercator_to_wgs84(raw_x, raw_y)

                    if not lat or not lon:
                        continue

                    name = (attrs.get(source["name_field"]) or "").strip()
                    if not name:
                        continue

                    category_str = source["default_category"]
                    rid = "odp_" + hashlib.md5(f"{name}{round(lat,5)}{round(lon,5)}".encode()).hexdigest()[:12]
                    address = (attrs.get(source["address_field"]) or "").strip()
                    phone = attrs.get(source["phone_field"]) if source["phone_field"] else None

                    seen_ids.add(rid)
                    if rid in existing_ids:
                        existing = db.query(Resource).filter(Resource.id == rid).first()
                        existing.name = name
                        existing.category = category_str
                        existing.address = address
                        existing.latitude = lat
                        existing.longitude = lon
                        existing.phone = phone
                        existing.is_active = True
                        existing.updated_at = datetime.now(timezone.utc)
                    else:
                        db.add(Resource(
                            id=rid, name=name, category=category_str,
                            address=address, latitude=lat, longitude=lon,
                            phone=phone, is_active=True,
                            updated_at=datetime.now(timezone.utc),
                        ))
                        existing_ids.add(rid)
                    total += 1

        if seen_ids:
            db.query(Resource).filter(Resource.id.notin_(seen_ids)).update(
                {"is_active": False}, synchronize_session=False
            )
        db.commit()
        logger.info(f"[scheduler] ingest_open_data_philly — upserted {total} resources")
    except Exception as e:
        db.rollback()
        logger.error(f"[scheduler] ingest_open_data_philly — error: {e}")
    finally:
        db.close()


def ingest_crime_data():
    """Nightly rolling 90-day crime incidents from OpenDataPhilly, aggregated into ~400m grid cells."""
    import httpx
    from collections import defaultdict
    from datetime import datetime, timezone
    from database import SessionLocal
    from models import CrimeCell

    CARTO_BASE = "https://phl.carto.com/api/v2/sql"
    # Cast dispatch_date to ::date to avoid "text >= date" operator error.
    CARTO_QUERY = (
        "SELECT point_x, point_y FROM incidents_part1_part2 "
        "WHERE dispatch_date::date >= current_date - interval '90 days'"
    )
    CELL_SIZE = 0.005  # degrees, ~400m

    logger.info("[scheduler] ingest_crime_data — fetching")
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.get(CARTO_BASE, params={"q": CARTO_QUERY, "format": "json"})
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as e:
        logger.error(f"[scheduler] ingest_crime_data — fetch failed: {e}")
        return

    cell_counts: dict = defaultdict(int)
    for row in data.get("rows", []):
        lat = row.get("point_y")
        lon = row.get("point_x")
        if not lat or not lon:
            continue
        cell_lat = round(round(lat / CELL_SIZE) * CELL_SIZE, 5)
        cell_lon = round(round(lon / CELL_SIZE) * CELL_SIZE, 5)
        cell_counts[(cell_lat, cell_lon)] += 1

    if not cell_counts:
        logger.warning("[scheduler] ingest_crime_data — no rows returned")
        return

    max_count = max(cell_counts.values())

    db = SessionLocal()
    try:
        db.query(CrimeCell).delete()
        for (cell_lat, cell_lon), count in cell_counts.items():
            weight = round(count / max_count, 4)
            db.add(CrimeCell(
                latitude=cell_lat,
                longitude=cell_lon,
                weight=weight,
                incident_count=count,
                updated_at=datetime.now(timezone.utc),
            ))
        db.commit()
        logger.info(f"[scheduler] ingest_crime_data — inserted {len(cell_counts)} cells from {sum(cell_counts.values())} incidents")
    except Exception as e:
        db.rollback()
        logger.error(f"[scheduler] ingest_crime_data — DB error: {e}")
    finally:
        db.close()


def ingest_septa_stops():
    """Weekly download of SEPTA GTFS stops.txt, upserted into septa_stops table."""
    import io
    import zipfile
    import csv
    import httpx
    from datetime import datetime, timezone
    from database import SessionLocal
    from models import SeptaStop

    GTFS_URL = "https://www3.septa.org/developer/gtfs_public.zip"

    logger.info("[scheduler] ingest_septa_stops — downloading GTFS")
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.get(GTFS_URL)
            resp.raise_for_status()
    except httpx.HTTPError as e:
        logger.error(f"[scheduler] ingest_septa_stops — download failed: {e}")
        return

    db = SessionLocal()
    try:
        upserted = 0
        # The SEPTA GTFS zip contains nested zips (google_bus.zip, google_rail.zip).
        # stops.txt lives inside google_bus.zip.
        with zipfile.ZipFile(io.BytesIO(resp.content)) as outer_zf:
            with outer_zf.open("google_bus.zip") as bus_zip_bytes:
                inner_zf = zipfile.ZipFile(io.BytesIO(bus_zip_bytes.read()))
        with inner_zf:
            with inner_zf.open("stops.txt") as stops_file:
                reader = csv.DictReader(io.TextIOWrapper(stops_file, encoding="utf-8"))
                for row in reader:
                    stop_id = row.get("stop_id", "").strip()
                    if not stop_id:
                        continue
                    try:
                        lat = float(row["stop_lat"])
                        lon = float(row["stop_lon"])
                    except (ValueError, KeyError):
                        continue

                    name = row.get("stop_name", "").strip()
                    existing = db.query(SeptaStop).filter(SeptaStop.id == stop_id).first()
                    if existing:
                        existing.name = name
                        existing.latitude = lat
                        existing.longitude = lon
                        existing.updated_at = datetime.now(timezone.utc)
                    else:
                        db.add(SeptaStop(
                            id=stop_id,
                            name=name,
                            latitude=lat,
                            longitude=lon,
                            stop_type="bus",
                            updated_at=datetime.now(timezone.utc),
                        ))
                    upserted += 1

        db.commit()
        logger.info(f"[scheduler] ingest_septa_stops — upserted {upserted} stops")
    except Exception as e:
        db.rollback()
        logger.error(f"[scheduler] ingest_septa_stops — error: {e}")
    finally:
        db.close()


def scrape_university_events():
    """
    Refresh Drexel events weekly via the DragonLink public API.
    Other schools are not implemented — their events are static seed data.
    """
    try:
        import scrape_drexel
        scrape_drexel.seed(take=50)
        logger.info("[scheduler] scrape_university_events — Drexel refresh complete")
    except Exception as e:
        logger.error(f"[scheduler] scrape_university_events — error: {e}")


def start_scheduler():
    # Crime overlay — every 6 hours
    scheduler.add_job(ingest_crime_data, "interval", hours=6, id="crime_data")
    # Drexel campus events — weekly on Monday at 6am
    scheduler.add_job(scrape_university_events, "cron", day_of_week="mon", hour=6, minute=0, id="university_events")
    # Static resources (clinics, shelters) — weekly on Sunday at 2am
    scheduler.add_job(ingest_open_data_philly, "cron", day_of_week="sun", hour=2, minute=0, id="open_data_philly")
    # SEPTA stops — weekly on Sunday at 4am
    scheduler.add_job(ingest_septa_stops, "cron", day_of_week="sun", hour=4, id="septa_stops")
    scheduler.start()
    logger.info("[scheduler] started — 4 jobs scheduled")
