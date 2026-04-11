from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime, timezone
import enum
from database import Base


class ResourceCategory(str, enum.Enum):
    food_bank = "food_bank"
    shelter = "shelter"
    clinic = "clinic"
    mental_health = "mental_health"
    septa = "septa"
    support_group = "support_group"
    campus_resource = "campus_resource"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(SAEnum(ResourceCategory), nullable=False, index=True)
    address = Column(String)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    phone = Column(String)
    hours = Column(String)
    description = Column(Text)
    is_active = Column(Boolean, default=True, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    university = Column(String, index=True)  # drexel, temple, upenn, ccp, saint_josephs, lasalle
    location = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime)
    category = Column(String, default="free_food", index=True)  # free_food, clinic_popup, resource, event
    resource_id = Column(String)
    source_url = Column(String)
    scraped_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class SeptaStop(Base):
    __tablename__ = "septa_stops"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    stop_type = Column(String)  # bus, trolley, subway
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class CrimeCell(Base):
    __tablename__ = "crime_cells"

    id = Column(Integer, primary_key=True, autoincrement=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    weight = Column(Float, nullable=False)  # normalized 0–1
    incident_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
