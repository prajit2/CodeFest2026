from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import FeedItemSchema
from services.stub_data import STUB_EVENTS

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("", response_model=List[FeedItemSchema])
def get_feed(
    university: Optional[str] = Query(None),
    needs: Optional[str] = Query(None),  # comma-separated: food,mental_health,substance
    db: Session = Depends(get_db),
):
    """
    Personalized feed. University students see their campus events first.
    needs param filters by content type (food, mental_health, substance).
    TODO Week 3: real personalization logic using user preferences.
    """
    items = list(STUB_EVENTS)

    # Campus events float to top for students
    if university:
        campus = [e for e in items if e.get("university") == university]
        other = [e for e in items if e.get("university") != university]
        items = campus + other

    items = sorted(items, key=lambda e: e["start_time"])
    return items
