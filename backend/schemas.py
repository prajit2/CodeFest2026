from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class SeptaStopSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    latitude: float
    longitude: float
    routes: List[str] = []


class ResourceSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    address: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    hours: Optional[str] = None
    description: Optional[str] = None
    nearest_septa_stops: Optional[List[SeptaStopSchema]] = None


class EventSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    university: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: str  # ISO string
    end_time: Optional[str] = None
    category: str
    resource_id: Optional[str] = None


class FeedItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    university: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: str
    category: str
    resource_id: Optional[str] = None


class CrimePointSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    latitude: float
    longitude: float
    weight: float


class SeptaArrivalSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    route: str
    destination: str
    minutes_away: int
