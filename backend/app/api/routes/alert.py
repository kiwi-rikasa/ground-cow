from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Literal
from sqlmodel import select
from sqlalchemy.orm import selectinload

from app.services.alert import send_email
from ...models.models import Alert, Event, Zone, User
from ...models.schemas.alert import AlertCreate, AlertUpdate, AlertPublic, AlertsPublic
from app.api.deps import (
    SessionDep,
    validate_fk_exists,
    require_session_user,
    require_controller,
    require_airflow_key,
)

alert_router = APIRouter()


@alert_router.get("/", response_model=AlertsPublic)
def list_alerts(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    alert_state: Optional[str] = None,
    zone_id: Optional[int] = None,
    sort_by: Optional[str] = "alert_created_at",
    order: Literal["asc", "desc"] = "desc",
    _: User = Depends(require_session_user),
) -> AlertsPublic:
    """
    Get specified alerts.
    """
    query = select(Alert).options(
        selectinload(Alert.zone),
        selectinload(Alert.event),
    )

    if alert_state is not None:
        query = query.where(Alert.alert_state == alert_state)
    if zone_id is not None:
        query = query.where(Alert.zone_id == zone_id)

    if hasattr(Alert, sort_by):
        column = getattr(Alert, sort_by)
        query = query.order_by(column.asc() if order == "asc" else column.desc())

    alerts = session.exec(query.offset(offset).limit(limit)).all()
    return AlertsPublic(data=[AlertPublic.model_validate(alert) for alert in alerts])


@alert_router.get("/{alert_id}", response_model=AlertPublic)
def get_alert(
    alert_id: int,
    session: SessionDep,
    _: User = Depends(require_session_user),
) -> AlertPublic:
    """
    Get a specific alert by ID.
    """
    query = (
        select(Alert)
        .where(Alert.alert_id == alert_id)
        .options(selectinload(Alert.zone), selectinload(Alert.event))
    )
    alert = session.exec(query).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@alert_router.post("/", response_model=AlertPublic)
def create_alert(
    alert_in: AlertCreate,
    session: SessionDep,
    _: bool = Depends(require_airflow_key),
) -> AlertPublic:
    """
    Create a new alert.
    """
    validate_fk_exists(session, Event, alert_in.event_id, "event_id")
    validate_fk_exists(session, Zone, alert_in.zone_id, "zone_id")
    validate_fk_exists(
        session, Alert, alert_in.alert_is_suppressed_by, "alert_is_suppressed_by"
    )

    alert = Alert.model_validate(alert_in)

    session.add(alert)
    session.commit()
    session.refresh(alert)

    if alert.alert_is_suppressed_by is None:
        users = session.exec(select(User).where(User.zone_id == alert.zone_id)).all()
        send_email(
            f"Alert {alert.alert_id}",
            f"Hi! please check the alert {alert.alert_id} for zone {alert.zone.zone_name}",
            [user.user_email for user in users],
        )

    return alert


@alert_router.patch("/{alert_id}", response_model=AlertPublic)
def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> AlertPublic:
    """
    Update alert state or fields.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    update_dict = alert_in.model_dump(exclude_unset=True)
    alert.sqlmodel_update(update_dict)

    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert


@alert_router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> dict:
    """
    Delete a specific alert by ID.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    session.delete(alert)
    session.commit()
    return {"message": f"Alert {alert_id} deleted successfully"}
