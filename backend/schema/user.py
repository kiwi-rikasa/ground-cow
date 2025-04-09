from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
from ..models.consts import UserRole


# Shared fields
class UserBase(SQLModel):
    user_email: str
    user_name: str
    user_role: UserRole = Field(default=UserRole.operator)


# Create input
class UserCreate(UserBase):
    pass


# Update input
class UserUpdate(SQLModel):
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    user_role: Optional[UserRole] = None


# Response schema
class UserPublic(UserBase):
    user_id: int
    user_created_at: datetime


# List wrapper
class UsersPublic(SQLModel):
    data: list[UserPublic]