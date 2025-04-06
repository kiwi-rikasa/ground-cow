from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from .consts import UserRole, AlertState, EventSeverity


class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    user_created_at: datetime = Field(default_factory=datetime.now)
    user_email: str
    user_name: str
    user_role: UserRole = Field(default="operator")  # admin/control/operator

    reports: list["Report"] = Relationship(back_populates="user")


class Event(SQLModel, table=True):
    event_id: Optional[int] = Field(default=None, primary_key=True)
    event_created_at: datetime = Field(default_factory=datetime.now)
    event_depth: float
    event_epicenter: str
    event_location: str
    event_magnitude: float
    event_occurred_at: datetime
    event_source: str  # e.g., CWB Open Data
    event_severity: EventSeverity = Field(default="NA")  # NA / L1 / L2
    event_is_suppressed_by: Optional[int] = Field(
        default=None, foreign_key="event.event_id"
    )

    suppressed_by: Optional["Event"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Event.event_id"}
    )
    alerts: list["Alert"] = Relationship(back_populates="event")


class Alert(SQLModel, table=True):
    alert_id: Optional[int] = Field(default=None, primary_key=True)
    event_id: Optional[int] = Field(default=None, foreign_key="event.event_id")
    alert_created_at: datetime = Field(default_factory=datetime.now)
    alert_alert_time: datetime
    alert_state: AlertState

    event: "Event" = Relationship(back_populates="alerts")
    reports: list["Report"] = Relationship(back_populates="alert")


class Zone(SQLModel, table=True):
    zone_id: Optional[int] = Field(default=None, primary_key=True)
    zone_created_at: datetime = Field(default_factory=datetime.now)
    zone_name: Optional[str] = Field(default=None, unique=True)
    zone_note: str
    zone_regions: str

    reports: list["Report"] = Relationship(back_populates="zone")


class Report(SQLModel, table=True):
    report_id: Optional[int] = Field(default=None, primary_key=True)
    alert_id: Optional[int] = Field(default=None, foreign_key="alert.alert_id")
    user_id: Optional[int] = Field(default=None, foreign_key="user.user_id")
    report_created_at: datetime = Field(default_factory=datetime.now)
    report_action_flag: bool  # true = 啟動戰情, false = 否
    report_damage_flag: bool  # true = 有損傷, false = 無損傷
    report_factory_zone: Optional[int] = Field(default=None, foreign_key="zone.zone_id")
    report_reported_at: datetime

    alert: "Alert" = Relationship(back_populates="reports")
    user: "User" = Relationship(back_populates="reports")
    zone: "Zone" = Relationship(back_populates="reports")
