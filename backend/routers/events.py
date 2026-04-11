from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import EventSchema
from models import Event

router = APIRouter(prefix="/events", tags=["events"])


def _event_to_schema(e: Event) -> EventSchema:
    return EventSchema(
        id=e.id,
        title=e.title,
        description=e.description,
        university=e.university,
        location=e.location,
        latitude=e.latitude,
        longitude=e.longitude,
        start_time=e.start_time.isoformat() + "Z",
        end_time=e.end_time.isoformat() + "Z" if e.end_time else None,
        category=e.category,
        resource_id=e.resource_id,
    )


@router.get("", response_model=List[EventSchema])
def list_events(
    university: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Event)
    if university:
        query = query.filter(Event.university == university)
    if category:
        query = query.filter(Event.category == category)
    query = query.order_by(Event.start_time.asc())
    return [_event_to_schema(e) for e in query.all()]
