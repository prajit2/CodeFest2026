from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import math
from database import get_db
from schemas import ResourceSchema
from services.stub_data import STUB_RESOURCES

router = APIRouter(prefix="/resources", tags=["resources"])


def _distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _get_resources(db: Session):
    # TODO Week 3: swap stub for real DB query
    # return db.query(Resource).filter(Resource.is_active == True).all()
    return STUB_RESOURCES


@router.get("", response_model=List[ResourceSchema])
def list_resources(
    category: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    resources = _get_resources(db)
    if category:
        resources = [r for r in resources if r["category"] == category]
    return resources


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
    resources = _get_resources(db)
    if category:
        resources = [r for r in resources if r["category"] == category]
    nearby = [r for r in resources if _distance_km(lat, lon, r["latitude"], r["longitude"]) <= radius_km]
    nearby.sort(key=lambda r: _distance_km(lat, lon, r["latitude"], r["longitude"]))
    return nearby


@router.get("/{resource_id}", response_model=ResourceSchema)
def get_resource(resource_id: str, db: Session = Depends(get_db)):
    resources = _get_resources(db)
    resource = next((r for r in resources if r["id"] == resource_id), None)
    if not resource:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource
