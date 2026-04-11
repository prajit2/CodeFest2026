from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from database import get_db
from schemas import FeedItemSchema
from models import Event, Resource

router = APIRouter(prefix="/feed", tags=["feed"])

NEEDS_TO_CATEGORIES = {
    "food": {"free_food", "food_bank"},
    "mental_health": {"mental_health", "clinic", "clinic_popup"},
    "substance": {"support_group", "event"},
}


def _event_to_feed(e: Event) -> FeedItemSchema:
    return FeedItemSchema(
        id=e.id,
        title=e.title,
        description=e.description,
        university=e.university,
        location=e.location,
        start_time=e.start_time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        category=e.category,
        resource_id=e.resource_id,
    )


def _resource_to_feed(r: Resource) -> FeedItemSchema:
    cat = r.category.value if hasattr(r.category, "value") else r.category
    return FeedItemSchema(
        id=r.id,
        title=r.name,
        description=r.description,
        university=None,
        location=r.address,
        start_time=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        category=cat,
        resource_id=r.id,
    )


@router.get("", response_model=List[FeedItemSchema])
def get_feed(
    university: Optional[str] = Query(None),
    needs: Optional[str] = Query(None),  # comma-separated: food,mental_health,substance
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """
    Personalized feed. University students see their campus events first.
    needs param filters by content type (food, mental_health, substance).
    """
    now = datetime.now(timezone.utc)
    events = [_event_to_feed(e) for e in db.query(Event).filter(Event.start_time >= now).all()]
    resources = [_resource_to_feed(r) for r in db.query(Resource).filter(Resource.is_active == True).all()]
    items = events + resources

    if needs:
        allowed: set = set()
        for need in needs.split(","):
            allowed |= NEEDS_TO_CATEGORIES.get(need.strip(), set())
        items = [i for i in items if i.category in allowed]

    if university:
        campus = [i for i in items if i.university == university]
        other = [i for i in items if i.university != university]
        items = campus + other

    return items[offset : offset + limit]
