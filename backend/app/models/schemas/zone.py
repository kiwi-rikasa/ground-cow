from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# Shared fields
class ZoneBase(SQLModel):
    zone_name: Optional[str] = None
    zone_note: str
    zone_regions: str


# Create input
class ZoneCreate(ZoneBase):
    pass


# Update input
class ZoneUpdate(SQLModel):
    zone_name: Optional[str] = None
    zone_note: Optional[str] = None
    zone_regions: Optional[str] = None


# Response schema
class ZonePublic(ZoneBase):
    zone_id: int
    zone_created_at: datetime


# List wrapper
class ZonesPublic(SQLModel):
    data: list[ZonePublic]
