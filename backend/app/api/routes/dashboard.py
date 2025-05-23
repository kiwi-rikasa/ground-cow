from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from ...models.models import Earthquake, Event, Alert, Report, User
from app.api.deps import SessionDep, require_session_user
from ...services.dashboard import (
    get_zone_stats,
    get_zone_event_trend,
    get_zone_histograms,
    get_earthquake_stats,
    get_earthquake_event_type,
    get_earthquake_progress,
)

dashboard_router = APIRouter()


@dashboard_router.get("/zone/{zone_id}")
def get_zone_dashboard(
    zone_id: int,
    weeks: int,
    session: SessionDep,
    _: User = Depends(require_session_user),
) -> dict:
    """
    Get dashoard data for selected zone.
    """
    now = datetime.now()
    end = datetime.combine((now + timedelta(days=1)).date(), datetime.min.time())
    start = end - timedelta(weeks=weeks)

    events = session.exec(
        select(Event)
        .where(Event.zone_id == zone_id)
        .where(Event.event_created_at.between(start, end))
        .options(selectinload(Event.earthquake))
    ).all()

    alerts = session.exec(
        select(Alert).where(Alert.event_id.in_([e.event_id for e in events]))
    ).all()

    reports = session.exec(
        select(Report).where(Report.alert_id.in_([a.alert_id for a in alerts]))
    ).all()

    zone_stats = get_zone_stats(events, alerts, reports)
    zone_event_trend = get_zone_event_trend(events, weeks)
    zone_intensity_data, zone_magnitude_data = get_zone_histograms(events)

    return {
        "zoneStats": zone_stats,
        "zoneEventTrend": zone_event_trend,
        "zoneMagnitudeData": zone_magnitude_data,
        "zoneIntensityData": zone_intensity_data,
    }


@dashboard_router.get("/earthquake")
def get_filtered_earthquake_list(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    _: User = Depends(require_session_user),
) -> dict:
    """
    List all earthquakes with at least one L1/L2 events.
    """
    subq = select(Event.earthquake_id).where(Event.event_severity != "NA").distinct()
    filtered_ids = session.exec(subq).all()

    earthquakes = session.exec(
        select(Earthquake)
        .where(Earthquake.earthquake_id.in_(filtered_ids))
        .order_by(Earthquake.earthquake_occurred_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    list_items = [
        {
            "id": eq.earthquake_id,
            "label": f"{eq.earthquake_occurred_at.strftime('%Y-%m-%d %H:%M')} (M{round(eq.earthquake_magnitude, 1)})",
        }
        for eq in earthquakes
    ]

    return {"earthquakeList": list_items}


@dashboard_router.get("/earthquake/{earthquake_id}")
def get_earthquake_dashboard(
    earthquake_id: int,
    session: SessionDep,
    _: User = Depends(require_session_user),
) -> dict:
    """
    Get dashoard data for selected earthquake.
    """
    events = session.exec(
        select(Event)
        .where(Event.earthquake_id == earthquake_id)
        .options(selectinload(Event.zone))
    ).all()

    if not events:
        return {}

    alerts = session.exec(
        select(Alert).where(Alert.event_id.in_([e.event_id for e in events]))
    ).all()

    reports = session.exec(
        select(Report).where(Report.alert_id.in_([a.alert_id for a in alerts]))
    ).all()

    earthquake_stats = get_earthquake_stats(events, alerts, reports)
    earthquake_event_type = get_earthquake_event_type(events)
    earthquake_progress = get_earthquake_progress(events, alerts)

    return {
        **earthquake_stats,
        "earthquakeEventType": earthquake_event_type,
        "earthquakeProgress": earthquake_progress,
    }
