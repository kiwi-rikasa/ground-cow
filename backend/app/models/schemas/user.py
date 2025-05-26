from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

from app.models.schemas.zone import ZonePublic
from ..consts import UserRole


# Shared fields
class UserBase(SQLModel):
    user_email: str
    user_name: str
    user_role: UserRole = Field(default=UserRole.operator)
    zone_id: Optional[int] = None


# Create input
class UserCreate(UserBase):
    pass


# Update input
class UserUpdate(SQLModel):
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[UserRole] = None
    zone_id: Optional[int] = None


# Response schema
class UserPublic(UserBase):
    user_id: int
    user_created_at: datetime
    zone_id: Optional[int] = None
    zone: Optional[ZonePublic] = None


# List wrapper
class UsersPublic(SQLModel):
    data: list[UserPublic]
