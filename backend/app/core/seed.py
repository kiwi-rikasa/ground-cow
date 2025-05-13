from sqlmodel import Session, select
from datetime import datetime, timedelta
from random import randrange
from app.models.models import (
    Zone, Earthquake, Event, Alert, Report, User
)
from app.models.consts import EventSeverity, AlertState, UserRole

def seed_db(session: Session):
    print("Seeding database", session)
    if session.exec(select(User)).first():
        print("✅ Seed data already exists. Skipping.")
        return
    
    zones = [
        Zone(zone_name="Taipei", zone_note="North Area", zone_regions="Taipei City"),
        Zone(
            zone_name="Hsinchu", zone_note="North Area 2", zone_regions="Hsinchu City"
        ),
        Zone(
            zone_name="Taichung", zone_note="Central Area", zone_regions="Taichung City"
        ),
        Zone(zone_name="Tainan", zone_note="South Area 1", zone_regions="Tainan City"),
        Zone(
            zone_name="Kaohsiung",
            zone_note="South Area 2",
            zone_regions="Kaohsiung City",
        ),
    ]
    session.add_all(zones)
    session.commit()

    earthquakes = [
        Earthquake(
            earthquake_magnitude=2.5 + randrange(0, 4),
            earthquake_occurred_at=datetime.now() - timedelta(days=i),
            earthquake_source=f"Seed data {i}",
        )
        for i in range(30)
    ]
    session.add_all(earthquakes)
    session.commit()

    events = [
        Event(
            earthquake_id=earthquakes[i].earthquake_id,
            zone_id=zones[i%5].zone_id,
            event_intensity=earthquakes[i].earthquake_magnitude + randrange(-2, 2),
            event_severity=EventSeverity.L2 if earthquakes[i].earthquake_magnitude >= 4.5 else EventSeverity.L1,
        )
        for i in range(30)
    ]
    session.add_all(events)
    session.commit()

    alerts = [
        Alert(
            event_id=events[i].event_id,
            zone_id=zones[i%5].zone_id,
            alert_alert_time=datetime.now(),
            alert_state=AlertState.active if i %3 == 2 else AlertState.closed if i % 3 == 1 else AlertState.resolved,
        )
        for i in range(30)
    ]
    session.add_all(alerts)
    session.commit()

    users = [
        User(
            user_email=f"user{i}@seed.com",
            user_name=f"User{i}",
            user_role=UserRole.admin if i == 0 else UserRole.control if i == 1 else UserRole.operator,
        )
        for i in range(5)
    ]
    session.add_all(users)
    session.commit()

    reports = [
        Report(
            alert_id=alerts[i].alert_id,
            user_id=users[i%5].user_id,
            report_action_flag=(i % 2 == 0),
            report_damage_flag=(i % 2 == 1),
            report_factory_zone=zones[i%5].zone_id,
            report_reported_at=datetime.now(),
        )
        for i in range(30)
    ]
    session.add_all(reports)
    session.commit()

    print(
        "✅ Seed data inserted: 5 zones, 30 earthquakes, 30 events, 30 alerts, 5 users, 30 reports"
    )

if __name__ == "__main__":
    from app.core.db import engine

    with Session(engine) as session:
        seed_db(session)