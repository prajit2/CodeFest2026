from fastapi import APIRouter, Query, Path, Depends
from sqlalchemy.orm import Session
from typing import List
import math
from database import get_db
from schemas import SeptaStopSchema, SeptaArrivalSchema
from services.stub_data import STUB_RESOURCES, STUB_SEPTA_ARRIVALS

router = APIRouter(prefix="/transit", tags=["transit"])


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
    septa = [r for r in STUB_RESOURCES if r["category"] == "septa"]
    nearby = [
        {"id": s["id"], "name": s["name"], "latitude": s["latitude"], "longitude": s["longitude"], "routes": []}
        for s in septa
        if _distance_km(lat, lon, s["latitude"], s["longitude"]) <= radius_km
    ]
    return nearby


@router.get("/arrivals/{stop_id}", response_model=List[SeptaArrivalSchema])
def arrivals(stop_id: str = Path(...), db: Session = Depends(get_db)):
    """
    Cached SEPTA arrivals proxy.
    TODO: add Redis caching (30s TTL) and real SEPTA API call.
    """
    arrivals = STUB_SEPTA_ARRIVALS.get(stop_id, [])
    return arrivals
