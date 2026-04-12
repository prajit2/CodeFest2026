from fastapi import APIRouter, Query, Path, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import math
import httpx
from database import get_db
from schemas import SeptaStopSchema, SeptaArrivalSchema
from models import SeptaStop

router = APIRouter(prefix="/transit", tags=["transit"])

SEPTA_ARRIVALS_URL = "https://www3.septa.org/api/Arrivals/index.php"


def _distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/stops/nearby", response_model=List[SeptaStopSchema])
def stops_nearby(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(0.5),
    db: Session = Depends(get_db),
):
    all_stops = db.query(SeptaStop).all()
    return [
        SeptaStopSchema(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, routes=[])
        for s in all_stops
        if _distance_km(lat, lon, s.latitude, s.longitude) <= radius_km
    ]


@router.get("/arrivals/{stop_id}", response_model=List[SeptaArrivalSchema])
async def arrivals(stop_id: str = Path(...), db: Session = Depends(get_db)):
    """Live SEPTA arrivals proxy."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(SEPTA_ARRIVALS_URL, params={"stop_id": stop_id, "count": 5})
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="SEPTA API unavailable")

    results: List[SeptaArrivalSchema] = []
    # Response shape: { "stop_name": { "Northbound": [...], "Southbound": [...] } }
    # SEPTA returns [] or a string on errors — guard before calling .items()
    if not isinstance(data, dict):
        return results
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
    return results
