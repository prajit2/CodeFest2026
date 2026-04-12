from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from database import get_db
from schemas import FeedItemSchema
from models import Event, Resource, ResourceCategory
from utils import distance_km

router = APIRouter(prefix="/feed", tags=["feed"])

UNIVERSITY_COORDS: dict = {
    "drexel":        (39.9558, -75.1875),
    "temple":        (39.9806, -75.1553),
    "upenn":         (39.9522, -75.1932),
    "ccp":           (39.9609, -75.1671),
    "saint_josephs": (40.0038, -75.2279),
    "lasalle":       (40.0348, -75.1639),
}

NEEDS_TO_CATEGORIES = {
    "food": {"free_food", "food_bank"},
    "mental_health": {"mental_health", "clinic", "clinic_popup"},
    "substance": {"support_group", "event"},
    "shelter": {"shelter"},
    "campus": {"campus_resource"},
}

# Categories shown in the feed (exclude septa — not useful as feed items)
FEED_CATEGORIES = {
    ResourceCategory.food_bank,
    ResourceCategory.shelter,
    ResourceCategory.clinic,
    ResourceCategory.mental_health,
    ResourceCategory.support_group,
}


def _event_to_feed(e: Event) -> FeedItemSchema:
    return FeedItemSchema(
        id=e.id,
        title=e.title,
        description=e.description,
        university=e.university,
        location=e.location,
        latitude=e.latitude,
        longitude=e.longitude,
        start_time=e.start_time.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        category=e.category,
        resource_id=e.resource_id,
    )


def _resource_to_feed(r: Resource) -> FeedItemSchema:
    cat = r.category.value if hasattr(r.category, "value") else r.category
    # For campus resources, university slug is stored in description
    university = r.description if r.category == ResourceCategory.campus_resource else None
    return FeedItemSchema(
        id=r.id,
        title=r.name,
        description=None,
        university=university,
        location=r.address,
        latitude=r.latitude,
        longitude=r.longitude,
        start_time=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
        category=cat,
        resource_id=r.id,
    )


@router.get("", response_model=List[FeedItemSchema])
def get_feed(
    university: Optional[str] = Query(None),
    needs: Optional[str] = Query(None),  # comma-separated: food,mental_health,substance,shelter,campus
    db: Session = Depends(get_db),
):
    """
    Personalized feed. University students see their campus events first.
    needs param filters by content type (food, mental_health, substance, shelter, campus).
    SEPTA stops are excluded — not useful as feed items.
    """
    now = datetime.now(timezone.utc)
    events = [_event_to_feed(e) for e in db.query(Event).filter(Event.start_time >= now).all()]

    # Query each category separately to guarantee all types are included
    resources = []
    for cat in FEED_CATEGORIES:
        rows = db.query(Resource).filter(
            Resource.is_active == True,
            Resource.category == cat,
        ).all()
        resources.extend(_resource_to_feed(r) for r in rows)
    items = events + resources

    if needs:
        allowed: set = set()
        for need in needs.split(","):
            allowed |= NEEDS_TO_CATEGORIES.get(need.strip(), set())
        items = [i for i in items if i.category in allowed]

    uni_coords = UNIVERSITY_COORDS.get(university) if university else None

    def dist_to_uni(item: FeedItemSchema) -> float:
        if uni_coords and item.latitude is not None and item.longitude is not None:
            return distance_km(uni_coords[0], uni_coords[1], item.latitude, item.longitude)
        return float("inf")

    if university:
        campus = [i for i in items if i.university == university]
        other = [i for i in items if i.university != university]
        campus.sort(key=dist_to_uni)
        other.sort(key=dist_to_uni)
        items = campus + other
    elif uni_coords:
        items.sort(key=dist_to_uni)

    return items
