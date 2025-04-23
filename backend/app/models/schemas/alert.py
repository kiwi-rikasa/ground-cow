from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from ..consts import AlertState


# Shared fields
class AlertBase(SQLModel):
    event_id: int
    zone_id: int
    alert_alert_time: datetime
    alert_state: AlertState = Field(default=AlertState.active)
    alert_is_suppressed_by: Optional[int] = None


# Create input
class AlertCreate(AlertBase):
    pass


# Update input
class AlertUpdate(SQLModel):
    alert_state: Optional[AlertState] = None
    alert_is_suppressed_by: Optional[int] = None


# Response schema
class AlertPublic(AlertBase):
    alert_id: int
    alert_created_at: datetime


# List wrapper
class AlertsPublic(SQLModel):
    data: list[AlertPublic]
