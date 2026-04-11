from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from database import get_db
from schemas import ResourceSchema
from models import Resource
from utils import distance_km

router = APIRouter(prefix="/resources", tags=["resources"])


def _to_schema(r: Resource) -> ResourceSchema:
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
        nearest_septa_stops=None,
    )


@router.get("", response_model=List[ResourceSchema])
def list_resources(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.is_active == True)
    if category:
        query = query.filter(Resource.category == category)
    return [_to_schema(r) for r in query.all()]


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
    lat_delta = radius_km / 111.0
    lon_delta = radius_km / (111.0 * math.cos(math.radians(lat)))
    query = query.filter(
        Resource.latitude.between(lat - lat_delta, lat + lat_delta),
        Resource.longitude.between(lon - lon_delta, lon + lon_delta),
    )
    all_resources = query.all()
    nearby = [r for r in all_resources if distance_km(lat, lon, r.latitude, r.longitude) <= radius_km]
    nearby.sort(key=lambda r: distance_km(lat, lon, r.latitude, r.longitude))
    return [_to_schema(r) for r in nearby]


@router.get("/{resource_id}", response_model=ResourceSchema)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    r = db.query(Resource).filter(Resource.id == resource_id, Resource.is_active == True).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _to_schema(r)
