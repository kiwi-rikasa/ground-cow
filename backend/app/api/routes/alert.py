from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from ...models.models import Alert
from ...models.schemas.alert import AlertCreate, AlertUpdate, AlertPublic, AlertsPublic

alert_router = APIRouter()


@alert_router.get("/", response_model=AlertsPublic)
def list_alerts(session: SessionDep) -> AlertsPublic:
    """
    Get all alerts.
    """
    alerts = session.exec(select(Alert)).all()
    return AlertsPublic(
        data=[AlertPublic.model_validate(alert) for alert in alerts],
        count=len(alerts),
    )


@alert_router.get("/{alert_id}", response_model=AlertPublic)
def get_alert(alert_id: int, session: SessionDep) -> AlertPublic:
    """
    Get a specific alert by ID.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@alert_router.post("/", response_model=AlertPublic)
def create_alert(alert_in: AlertCreate, session: SessionDep) -> AlertPublic:
    """
    Create a new alert.
    """
    alert = Alert.model_validate(alert_in)
    session.add(alert)
    session.commit()
    session.refresh(alert)
    return alert


@alert_router.patch("/{alert_id}", response_model=AlertPublic)
def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    session: SessionDep,
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
def delete_alert(alert_id: int, session: SessionDep) -> dict:
    """
    Delete a specific alert by ID.
    """
    alert = session.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    session.delete(alert)
    session.commit()
    return {"message": f"Alert {alert_id} deleted successfully"}
