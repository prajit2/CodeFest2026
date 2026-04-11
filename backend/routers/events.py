from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import EventSchema
from services.stub_data import STUB_EVENTS

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=List[EventSchema])
def list_events(
    university: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    # TODO Week 3: swap stub for real DB query
    events = STUB_EVENTS
    if university:
        events = [e for e in events if e.get("university") == university]
    if category:
        events = [e for e in events if e.get("category") == category]
    events = sorted(events, key=lambda e: e["start_time"])
    return events
