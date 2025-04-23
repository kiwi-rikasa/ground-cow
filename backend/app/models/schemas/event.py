from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from ..consts import EventSeverity


# Shared fields
class EventBase(SQLModel):
    event_intensity: float
    event_severity: EventSeverity = Field(default=EventSeverity.NA)
    event_is_suppressed_by: Optional[int] = None


# Create input
class EventCreate(EventBase):
    earthquake_id: int
    zone_id: int


# Update input
class EventUpdate(SQLModel):
    event_intensity: Optional[float] = None
    event_severity: Optional[EventSeverity] = None
    event_is_suppressed_by: Optional[int] = None


# Response schema
class EventPublic(EventBase):
    event_id: int
    earthquake_id: int
    zone_id: int
    event_created_at: datetime


# List wrapper
class EventsPublic(SQLModel):
    data: list[EventPublic]
