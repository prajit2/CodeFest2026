from fastapi import APIRouter, Query, Path, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import math
import httpx
import time
from database import get_db
from schemas import SeptaStopSchema, SeptaArrivalSchema
from models import SeptaStop
from utils import distance_km

_arrivals_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL = 60  # seconds

router = APIRouter(prefix="/transit", tags=["transit"])

SEPTA_ARRIVALS_URL = "https://www3.septa.org/api/Arrivals/index.php"


@router.get("/stops/nearby", response_model=List[SeptaStopSchema])
def stops_nearby(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(0.5),
    db: Session = Depends(get_db),
):
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    all_stops = db.query(SeptaStop).filter(
        SeptaStop.latitude.between(lat - lat_delta, lat + lat_delta),
        SeptaStop.longitude.between(lon - lon_delta, lon + lon_delta),
    ).all()
    return [
        SeptaStopSchema(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, routes=[])
        for s in all_stops
        if distance_km(lat, lon, s.latitude, s.longitude) <= radius_km
    ]


@router.get("/arrivals/{stop_id}", response_model=List[SeptaArrivalSchema])
async def arrivals(stop_id: str = Path(...)):
    """Live SEPTA arrivals proxy."""
    cached = _arrivals_cache.get(stop_id)
    if cached and (time.time() - cached[0]) < CACHE_TTL:
        return cached[1]
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(SEPTA_ARRIVALS_URL, params={"stop_id": stop_id, "count": 5})
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="SEPTA API unavailable")

    results: List[SeptaArrivalSchema] = []
    # Response shape: { "stop_name": { "Northbound": [...], "Southbound": [...] } }
    for stop_name, directions in data.items():
        if not isinstance(directions, dict):
            continue
        for direction, arrivals_list in directions.items():
            if not isinstance(arrivals_list, list):
                continue
            for arr in arrivals_list:
                try:
                    results.append(SeptaArrivalSchema(
                        route=str(arr.get("route_id", "")),
                        destination=str(arr.get("destination", direction)),
                        minutes_away=int(arr.get("Offset", 0)),
                    ))
                except (ValueError, TypeError):
                    continue
    _arrivals_cache[stop_id] = (time.time(), results)
    return results
