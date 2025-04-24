from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# Shared fields
class EarthquakeBase(SQLModel):
    earthquake_magnitude: float
    earthquake_occurred_at: datetime
    earthquake_source: str


# Create input
class EarthquakeCreate(EarthquakeBase):
    earthquake_id: int


# Update input
class EarthquakeUpdate(SQLModel):
    earthquake_magnitude: Optional[float] = None
    earthquake_occurred_at: Optional[datetime] = None
    earthquake_source: Optional[str] = None


# Response schema
class EarthquakePublic(EarthquakeBase):
    earthquake_id: int
    earthquake_created_at: datetime


# List wrapper
class EarthquakesPublic(SQLModel):
    data: list[EarthquakePublic]
