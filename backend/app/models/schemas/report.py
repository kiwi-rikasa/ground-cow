from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel


# Shared fields
class ReportBase(SQLModel):
    alert_id: Optional[int] = None
    user_id: Optional[int] = None
    report_action_flag: bool
    report_damage_flag: bool
    report_factory_zone: Optional[int] = None
    report_reported_at: datetime


# Create input
class ReportCreate(ReportBase):
    pass


# Update input
class ReportUpdate(SQLModel):
    alert_id: Optional[int] = None
    user_id: Optional[int] = None
    report_action_flag: Optional[bool] = None
    report_damage_flag: Optional[bool] = None
    report_factory_zone: Optional[int] = None
    report_reported_at: Optional[datetime] = None


# Response schema
class ReportPublic(ReportBase):
    report_id: int
    report_created_at: datetime


# List wrapper
class ReportsPublic(SQLModel):
    data: list[ReportPublic]
