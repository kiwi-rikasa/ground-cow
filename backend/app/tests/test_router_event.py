import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Event
from app.models.consts import EventSeverity


@pytest.fixture
def test_event(db_session: Session):
    """Create a test event for testing."""
    event = Event(
        event_depth=10.5,
        event_epicenter="Test Epicenter",
        event_location="Test Location",
        event_magnitude=5.2,
        event_occurred_at=datetime.now() - timedelta(hours=1),
        event_source="Test Source",
        event_severity=EventSeverity.NA,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event


def test_create_event(client: TestClient, test_event: Event):
    """Test creating a new event."""
    event_data = {
        "event_depth": 15.0,
        "event_epicenter": "Epicenter A",
        "event_location": "Location A",
        "event_magnitude": 4.8,
        "event_occurred_at": datetime.now().isoformat(),
        "event_source": "Sensor X",
        "event_severity": "L1",
    }

    response = client.post("/event/", json=event_data)
    assert response.status_code == 200

    data = response.json()
    assert data["event_depth"] == event_data["event_depth"]
    assert data["event_epicenter"] == event_data["event_epicenter"]
    assert data["event_location"] == event_data["event_location"]
    assert data["event_magnitude"] == event_data["event_magnitude"]
    assert data["event_source"] == event_data["event_source"]
    assert data["event_severity"] == event_data["event_severity"]
    assert "event_id" in data
    assert "event_occurred_at" in data
    assert "event_created_at" in data


def test_list_events(client: TestClient, test_event: Event):
    """Test listing all events."""
    response = client.get("/event/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test event is in the list
    event_ids = [event["event_id"] for event in data["data"]]
    assert test_event.event_id in event_ids


def test_get_event(client: TestClient, test_event: Event):
    """Test getting a specific event."""
    response = client.get(f"/event/{test_event.event_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["event_id"] == test_event.event_id
    assert data["event_depth"] == test_event.event_depth
    assert data["event_epicenter"] == test_event.event_epicenter
    assert data["event_location"] == test_event.event_location
    assert data["event_magnitude"] == test_event.event_magnitude
    assert data["event_source"] == test_event.event_source
    assert data["event_severity"] == test_event.event_severity


def test_get_event_not_found(client: TestClient):
    """Test getting a non-existing event."""
    response = client.get("/event/9999")
    assert response.status_code == 404


def test_update_event(client: TestClient, test_event: Event):
    """Test updating an event."""
    update_data = {"event_magnitude": 6.0}

    response = client.patch(f"/event/{test_event.event_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["event_id"] == test_event.event_id
    assert data["event_magnitude"] == update_data["event_magnitude"]
    assert data["event_depth"] == test_event.event_depth
    assert data["event_epicenter"] == test_event.event_epicenter
    assert data["event_location"] == test_event.event_location
    assert data["event_source"] == test_event.event_source
    assert data["event_severity"] == test_event.event_severity


def test_update_event_not_found(client: TestClient):
    """Test updating a non-existing event."""
    response = client.patch("/event/9999", json={"event_magnitude": 6.0})
    assert response.status_code == 404


def test_delete_event(client: TestClient, test_event: Event):
    """Test deleting an event."""
    response = client.delete(f"/event/{test_event.event_id}")
    assert response.status_code == 200

    # Verify the event has been deleted
    response = client.get(f"/event/{test_event.event_id}")
    assert response.status_code == 404


def test_delete_event_not_found(client: TestClient):
    """Test deleting a non-existing event."""
    response = client.delete("/event/9999")
    assert response.status_code == 404
