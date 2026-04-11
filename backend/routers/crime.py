from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import CrimePointSchema
from services.stub_data import STUB_CRIME_POINTS

router = APIRouter(prefix="/crime", tags=["crime"])


@router.get("/heatmap", response_model=List[CrimePointSchema])
def crime_heatmap(db: Session = Depends(get_db)):
    """
    Returns aggregated crime density grid for the map overlay.
    TODO Week 3: real nightly pipeline from OpenDataPhilly.
    """
    return STUB_CRIME_POINTS
