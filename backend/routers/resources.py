from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from database import get_db
from schemas import ResourceSchema, SeptaStopSchema
from models import Resource, SeptaStop

router = APIRouter(prefix="/resources", tags=["resources"])


def _distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


_SEPTA_RADIUS_KM = 0.4  # ~400 m


def _nearest_stops(r: Resource, db: Session) -> List[SeptaStopSchema]:
    """Return SeptaStop rows within _SEPTA_RADIUS_KM of the given resource."""
    try:
        all_stops = db.query(SeptaStop).all()
        nearby = [
            s for s in all_stops
            if _distance_km(r.latitude, r.longitude, s.latitude, s.longitude) <= _SEPTA_RADIUS_KM
        ]
        nearby.sort(key=lambda s: _distance_km(r.latitude, r.longitude, s.latitude, s.longitude))
        return [SeptaStopSchema(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude) for s in nearby]
    except Exception:
        return []


def _to_schema(r: Resource, db: Session) -> ResourceSchema:
    return ResourceSchema(
        id=r.id,
        name=r.name,
        category=r.category.value if hasattr(r.category, "value") else r.category,
        address=r.address or "",
        latitude=r.latitude,
        longitude=r.longitude,
        phone=r.phone,
        hours=r.hours,
        description=r.description,
        nearest_septa_stops=_nearest_stops(r, db),
    )


@router.get("", response_model=List[ResourceSchema])
def list_resources(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.is_active == True)
    if category:
        query = query.filter(Resource.category == category)
    return [_to_schema(r, db) for r in query.all()]


@router.get("/categories")
def list_categories():
    return ["food_bank", "shelter", "clinic", "mental_health", "septa", "support_group", "campus_resource"]


@router.get("/nearby", response_model=List[ResourceSchema])
def resources_nearby(
    lat: float = Query(...),
    lon: float = Query(...),
    radius_km: float = Query(2.0),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.is_active == True)
    if category:
        query = query.filter(Resource.category == category)
    all_resources = query.all()
    nearby = [r for r in all_resources if _distance_km(lat, lon, r.latitude, r.longitude) <= radius_km]
    nearby.sort(key=lambda r: _distance_km(lat, lon, r.latitude, r.longitude))
    return [_to_schema(r, db) for r in nearby]


@router.get("/{resource_id}", response_model=ResourceSchema)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id, Resource.is_active == True).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _to_schema(r, db)
