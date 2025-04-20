from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from ..consts import EventSeverity


# Shared fields
class EventBase(SQLModel):
    event_depth: float
    event_epicenter: str
    event_location: str
    event_magnitude: float
    event_occurred_at: datetime
    event_source: str
    event_severity: EventSeverity = Field(default=EventSeverity.NA)
    event_is_suppressed_by: Optional[int] = None


# Create input
class EventCreate(EventBase):
    pass


# Update input
class EventUpdate(SQLModel):
    event_depth: Optional[float] = None
    event_epicenter: Optional[str] = None
    event_location: Optional[str] = None
    event_magnitude: Optional[float] = None
    event_occurred_at: Optional[datetime] = None
    event_source: Optional[str] = None
    event_severity: Optional[EventSeverity] = None
    event_is_suppressed_by: Optional[int] = None


# Response schema
class EventPublic(EventBase):
    event_id: int
    event_created_at: datetime


# List wrapper
class EventsPublic(SQLModel):
    data: list[EventPublic]
