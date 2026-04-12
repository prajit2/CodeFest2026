"""
Idempotent seed script — inserts STUB_RESOURCES, STUB_EVENTS, STUB_CRIME_POINTS,
and stub SEPTA stops into the database. Safe to run multiple times; skips rows
whose primary key already exists.

Usage:
    cd /Users/prajitrajan/Documents/CodeFest2026/backend && python3 seed.py
"""

import sys
import os
from datetime import datetime

# Ensure the backend package root is on the path regardless of cwd.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal
from models import Resource, Event, SeptaStop, CrimeCell, ResourceCategory
from services.stub_data import STUB_RESOURCES, STUB_EVENTS, STUB_CRIME_POINTS

# ---------------------------------------------------------------------------
# Stub SEPTA stops — these must exist so nearest_septa_stops queries return data.
# ---------------------------------------------------------------------------
STUB_SEPTA_STOPS = [
    {"id": "s1", "name": "15th St & Market St (BSL)", "latitude": 39.9524, "longitude": -75.1655, "stop_type": "subway"},
    {"id": "s2", "name": "30th St Station", "latitude": 39.9566, "longitude": -75.1825, "stop_type": "subway"},
    {"id": "s3", "name": "City Hall Station (BSL)", "latitude": 39.9527, "longitude": -75.1635, "stop_type": "subway"},
    {"id": "s4", "name": "Girard Station (BSL)", "latitude": 39.9720, "longitude": -75.1565, "stop_type": "subway"},
    {"id": "s5", "name": "Cecil B. Moore Station (BSL)", "latitude": 39.9790, "longitude": -75.1567, "stop_type": "subway"},
    {"id": "s6", "name": "Temple University Station (BSL)", "latitude": 39.9810, "longitude": -75.1549, "stop_type": "subway"},
    {"id": "s7", "name": "30th & Market (MFL)", "latitude": 39.9566, "longitude": -75.1825, "stop_type": "subway"},
    {"id": "s8", "name": "Walnut-Locust Station (BSL)", "latitude": 39.9490, "longitude": -75.1649, "stop_type": "subway"},
    {"id": "s9", "name": "Ellsworth-Federal Station (BSL)", "latitude": 39.9371, "longitude": -75.1650, "stop_type": "subway"},
    {"id": "s10", "name": "Broad & Washington (Bus)", "latitude": 39.9370, "longitude": -75.1660, "stop_type": "bus"},
]


def _ensure_tables():
    """Create all tables if they don't already exist."""
    Base.metadata.create_all(bind=engine)


def _seed_resources(db) -> int:
    inserted = 0
    for row in STUB_RESOURCES:
        if db.query(Resource).filter(Resource.id == row["id"]).first():
            continue
        # Skip SEPTA-category rows from resources — they live in septa_stops.
        if row.get("category") == "septa":
            continue
        db.add(Resource(
            id=row["id"],
            name=row["name"],
            category=ResourceCategory(row["category"]),
            address=row.get("address"),
            latitude=row["latitude"],
            longitude=row["longitude"],
            phone=row.get("phone"),
            hours=row.get("hours"),
            is_active=True,
            updated_at=datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def _seed_events(db) -> int:
    inserted = 0
    for row in STUB_EVENTS:
        if db.query(Event).filter(Event.id == row["id"]).first():
            continue
        # Parse ISO string back to datetime (strip trailing Z).
        def _parse(s):
            if s is None:
                return None
            return datetime.fromisoformat(s.rstrip("Z"))

        db.add(Event(
            id=row["id"],
            title=row["title"],
            description=row.get("description"),
            university=row.get("university"),
            location=row.get("location"),
            latitude=row.get("latitude"),
            longitude=row.get("longitude"),
            start_time=_parse(row["start_time"]),
            end_time=_parse(row.get("end_time")),
            category=row.get("category", "free_food"),
            scraped_at=datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def _seed_septa_stops(db) -> int:
    inserted = 0
    for row in STUB_SEPTA_STOPS:
        if db.query(SeptaStop).filter(SeptaStop.id == row["id"]).first():
            continue
        db.add(SeptaStop(
            id=row["id"],
            name=row["name"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            stop_type=row.get("stop_type"),
            updated_at=datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def _seed_crime_cells(db) -> int:
    # CrimeCell uses an auto-increment PK; check for exact lat/lon duplicates.
    inserted = 0
    for row in STUB_CRIME_POINTS:
        exists = (
            db.query(CrimeCell)
            .filter(
                CrimeCell.latitude == row["latitude"],
                CrimeCell.longitude == row["longitude"],
            )
            .first()
        )
        if exists:
            continue
        db.add(CrimeCell(
            latitude=row["latitude"],
            longitude=row["longitude"],
            weight=row["weight"],
            incident_count=0,
            updated_at=datetime.utcnow(),
        ))
        inserted += 1
    db.commit()
    return inserted


def main():
    print("Ensuring database tables exist...")
    _ensure_tables()

    db = SessionLocal()
    try:
        r = _seed_resources(db)
        e = _seed_events(db)
        s = _seed_septa_stops(db)
        c = _seed_crime_cells(db)
        print(f"Inserted: {r} resources, {e} events, {s} SEPTA stops, {c} crime cells")
        if r == 0 and e == 0 and s == 0 and c == 0:
            print("(all rows already present — nothing new inserted)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
