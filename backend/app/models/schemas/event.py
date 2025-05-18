from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from ..consts import EventSeverity

from app.models.schemas.zone import ZonePublic
from app.models.schemas.earthquake import EarthquakePublic


# Shared fields
class EventBase(SQLModel):
    event_intensity: float
    event_severity: EventSeverity = Field(default=EventSeverity.NA)


# Create input
class EventCreate(EventBase):
    earthquake_id: int
    zone_id: int


# Update input
class EventUpdate(SQLModel):
    event_intensity: Optional[float] = None
    event_severity: Optional[EventSeverity] = None


# Response schema
class EventPublic(EventBase):
    event_id: int
    earthquake_id: int
    earthquake: EarthquakePublic
    zone_id: int
    zone: ZonePublic
    event_created_at: datetime


# List wrapper
class EventsPublic(SQLModel):
    data: list[EventPublic]
