from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship, UniqueConstraint
from sqlalchemy import BigInteger, Column, ForeignKey

from .consts import UserRole, AlertState, EventSeverity


class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    user_created_at: datetime = Field(default_factory=datetime.now)
    user_email: str = Field(unique=True)
    user_name: str
    user_role: UserRole = Field(default=UserRole.operator)  # admin/control/operator
    zone_id: Optional[int] = Field(
        default=None, foreign_key="zone.zone_id", ondelete="SET NULL", nullable=True
    )

    reports: list["Report"] = Relationship(back_populates="user")
    zone: "Zone" = Relationship(back_populates="users")


class Earthquake(SQLModel, table=True):
    earthquake_id: Optional[int] = Field(
        default=None, sa_column=Column(BigInteger, primary_key=True)
    )
    earthquake_created_at: datetime = Field(default_factory=datetime.now)
    earthquake_magnitude: float
    earthquake_occurred_at: datetime
    earthquake_source: str  # e.g., CWB Open Data

    events: list["Event"] = Relationship(back_populates="earthquake")


class Event(SQLModel, table=True):
    event_id: Optional[int] = Field(default=None, primary_key=True)
    earthquake_id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            BigInteger(), ForeignKey("earthquake.earthquake_id", ondelete="CASCADE")
        ),
    )
    zone_id: Optional[int] = Field(
        default=None, foreign_key="zone.zone_id", ondelete="CASCADE"
    )
    event_created_at: datetime = Field(default_factory=datetime.now)
    event_intensity: float
    event_severity: EventSeverity = Field(default=EventSeverity.NA)  # NA / L1 / L2
    __table_args__ = (
        UniqueConstraint("earthquake_id", "zone_id", name="uq_event_earthquake_zone"),
    )

    earthquake: "Earthquake" = Relationship(back_populates="events")
    zone: "Zone" = Relationship(back_populates="events")
    alerts: list["Alert"] = Relationship(back_populates="event")


class Alert(SQLModel, table=True):
    alert_id: Optional[int] = Field(default=None, primary_key=True)
    event_id: Optional[int] = Field(
        default=None, foreign_key="event.event_id", ondelete="CASCADE"
    )
    zone_id: Optional[int] = Field(
        default=None, foreign_key="zone.zone_id", ondelete="CASCADE"
    )
    alert_created_at: datetime = Field(default_factory=datetime.now)
    alert_alert_time: datetime
    alert_state: AlertState = Field(default=AlertState.active)
    alert_is_suppressed_by: Optional[int] = Field(
        default=None, foreign_key="alert.alert_id", ondelete="SET NULL"
    )

    event: "Event" = Relationship(back_populates="alerts")
    zone: "Zone" = Relationship(back_populates="alerts")
    suppressed_by: Optional["Alert"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Alert.alert_id"}
    )
    reports: list["Report"] = Relationship(back_populates="alert")


class Zone(SQLModel, table=True):
    zone_id: Optional[int] = Field(default=None, primary_key=True)
    zone_created_at: datetime = Field(default_factory=datetime.now)
    zone_name: Optional[str] = Field(default=None, unique=True)
    zone_note: str
    zone_regions: str  # e.g., county name or station id

    events: list["Event"] = Relationship(back_populates="zone")
    alerts: list["Alert"] = Relationship(back_populates="zone")
    reports: list["Report"] = Relationship(back_populates="zone")

    users: list["User"] = Relationship(back_populates="zone")


class Report(SQLModel, table=True):
    report_id: Optional[int] = Field(default=None, primary_key=True)
    alert_id: Optional[int] = Field(
        default=None, foreign_key="alert.alert_id", ondelete="SET NULL"
    )
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.user_id", ondelete="SET NULL"
    )
    report_created_at: datetime = Field(default_factory=datetime.now)
    report_action_flag: bool  # true = 啟動戰情, false = 否
    report_damage_flag: bool  # true = 有損傷, false = 無損傷
    report_factory_zone: Optional[int] = Field(
        default=None, foreign_key="zone.zone_id", ondelete="SET NULL"
    )
    report_reported_at: datetime

    alert: "Alert" = Relationship(back_populates="reports")
    user: "User" = Relationship(back_populates="reports")
    zone: "Zone" = Relationship(back_populates="reports")
