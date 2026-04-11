"""
Scrape upcoming events from Drexel DragonLink and upsert into the events table.

Run from backend/ directory:
  source venv/bin/activate && python scrape_drexel.py

Can also be called from the scheduler for periodic refresh.
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))

import httpx
from datetime import datetime, timezone
from database import SessionLocal
from models import Event

DRAGONLINK_API = "https://dragonlink.drexel.edu/api/discovery/event/search"

def strip_html(text: str) -> str:
    """Remove HTML tags and decode basic entities."""
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&amp;", "&", text)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"&quot;", '"', text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def map_category(benefit_names: list, theme: str) -> str:
    """Map DragonLink benefits/theme to our event category."""
    benefits = [b.lower() for b in (benefit_names or [])]
    if "free food" in benefits:
        return "free_food"
    theme_lower = (theme or "").lower()
    if theme_lower in ("social", "arts", "recreation"):
        return "event"
    return "event"


def parse_dt(iso: str) -> datetime | None:
    if not iso:
        return None
    try:
        # Handle both "+00:00" and "Z" suffixes
        iso = iso.replace("Z", "+00:00")
        return datetime.fromisoformat(iso)
    except Exception:
        return None


def fetch_events(take=50) -> list[dict]:
    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    params = {
        "endsAfter": now_iso,
        "orderByField": "startsOn",
        "orderByDirection": "ascending",
        "status": "Approved",
        "take": str(take),
    }
    with httpx.Client(timeout=15) as client:
        resp = client.get(DRAGONLINK_API, params=params)
        resp.raise_for_status()
        return resp.json().get("value", [])


def seed(take=50):
    print(f"Fetching up to {take} upcoming Drexel events from DragonLink...")
    try:
        raw_events = fetch_events(take)
    except Exception as e:
        print(f"Fetch failed: {e}")
        return

    print(f"Got {len(raw_events)} events from API.")

    db = SessionLocal()
    inserted = 0
    updated = 0
    try:
        for ev in raw_events:
            eid = f"dragonlink_{ev['id']}"
            start = parse_dt(ev.get("startsOn"))
            end   = parse_dt(ev.get("endsOn"))
            if not start:
                continue

            category = map_category(ev.get("benefitNames"), ev.get("theme"))
            desc = strip_html(ev.get("description", ""))[:500]  # cap length
            title = ev.get("name", "").strip()
            location = (ev.get("location") or "Drexel University").strip()
            lat = ev.get("latitude")
            lon = ev.get("longitude")

            existing = db.query(Event).filter(Event.id == eid).first()
            if existing:
                existing.title = title
                existing.description = desc
                existing.location = location
                existing.start_time = start
                existing.end_time = end
                existing.latitude = lat
                existing.longitude = lon
                existing.category = category
                updated += 1
            else:
                db.add(Event(
                    id=eid,
                    title=title,
                    description=desc,
                    university="drexel",
                    location=location,
                    latitude=lat,
                    longitude=lon,
                    start_time=start,
                    end_time=end,
                    category=category,
                    source_url=f"https://dragonlink.drexel.edu/events/{ev['id']}",
                ))
                inserted += 1

        db.commit()
        print(f"Done: {inserted} inserted, {updated} updated.")
    except Exception as e:
        db.rollback()
        print(f"DB error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed(take=50)
