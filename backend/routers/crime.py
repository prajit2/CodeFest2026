from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import CrimePointSchema
from models import CrimeCell

router = APIRouter(prefix="/crime", tags=["crime"])


@router.get("/heatmap", response_model=List[CrimePointSchema])
def crime_heatmap(db: Session = Depends(get_db)):
    """Returns aggregated crime density grid for the map overlay."""
    cells = db.query(CrimeCell).all()
    return [CrimePointSchema(latitude=c.latitude, longitude=c.longitude, weight=c.weight) for c in cells]
