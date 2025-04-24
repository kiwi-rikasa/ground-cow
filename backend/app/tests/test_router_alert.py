import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Alert
from app.models.consts import AlertState


@pytest.fixture
def test_alert(db_session: Session):
    """Create a test alert for testing."""
    alert = Alert(
        event_id=0,
        zone_id=1,
        alert_alert_time=datetime.now(),
        alert_state=AlertState.active,
    )
    db_session.add(alert)
    db_session.commit()
    db_session.refresh(alert)
    return alert


def test_create_alert(client: TestClient):
    """Test creating a new alert."""
    alert_data = {
        "event_id": 1,
        "zone_id": 1,
        "alert_alert_time": datetime.now().isoformat(),
        "alert_state": "active",
        "alert_is_suppressed_by": 0,
    }

    response = client.post("/alert/", json=alert_data)
    assert response.status_code == 200

    data = response.json()
    assert data["event_id"] == alert_data["event_id"]
    assert data["alert_state"] == alert_data["alert_state"]
    assert data["alert_is_suppressed_by"] == alert_data["alert_is_suppressed_by"]
    assert "alert_id" in data
    assert "alert_created_at" in data


def test_list_alerts(client: TestClient, test_alert: Alert):
    """Test listing all alerts."""
    response = client.get("/alert/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test alert is in the list
    alert_ids = [alert["alert_id"] for alert in data["data"]]
    assert test_alert.alert_id in alert_ids


def test_get_alert(client: TestClient, test_alert: Alert):
    """Test getting a specific alert."""
    response = client.get(f"/alert/{test_alert.alert_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["alert_id"] == test_alert.alert_id
    assert data["event_id"] == test_alert.event_id
    assert data["alert_state"] == test_alert.alert_state


def test_get_alert_not_found(client: TestClient):
    """Test getting a non-existent alert."""
    response = client.get("/alert/9999")
    assert response.status_code == 404


def test_update_alert(client: TestClient, test_alert: Alert):
    """Test updating an alert."""
    update_data = {"alert_state": "resolved"}

    response = client.patch(f"/alert/{test_alert.alert_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["alert_id"] == test_alert.alert_id
    assert data["event_id"] == test_alert.event_id
    assert data["alert_state"] == update_data["alert_state"]
    assert data["alert_is_suppressed_by"] == test_alert.alert_is_suppressed_by


def test_update_alert_not_found(client: TestClient):
    """Test updating a non-existent alert."""
    response = client.patch("/alert/9999", json={"alert_state": "resolved"})
    assert response.status_code == 404


def test_delete_alert(client: TestClient, test_alert: Alert):
    """Test deleting an alert."""
    response = client.delete(f"/alert/{test_alert.alert_id}")
    assert response.status_code == 200

    # Verify the alert has been deleted
    response = client.get(f"/alert/{test_alert.alert_id}")
    assert response.status_code == 404


def test_delete_alert_not_found(client: TestClient):
    """Test deleting a non-existent alert."""
    response = client.delete("/alert/9999")
    assert response.status_code == 404
