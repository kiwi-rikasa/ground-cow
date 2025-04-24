import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Event
from app.models.consts import EventSeverity


@pytest.fixture
def test_event(db_session: Session):
    """Create a test event for testing."""
    event = Event(
        earthquake_id=2024123123595973999,
        zone_id=0,
        event_intensity=6.5,
        event_severity=EventSeverity.L2,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event


def test_create_event(client: TestClient):
    """Test creating a new event."""
    event_data = {
        "earthquake_id": 2025010100000040001,
        "zone_id": 0,
        "event_intensity": 2.0,
        "event_severity": EventSeverity.L1,
    }

    response = client.post("/event/", json=event_data)
    assert response.status_code == 200

    data = response.json()
    assert data["earthquake_id"] == event_data["earthquake_id"]
    assert data["zone_id"] == event_data["zone_id"]
    assert data["event_intensity"] == event_data["event_intensity"]
    assert data["event_severity"] == event_data["event_severity"]
    assert "event_id" in data
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
    assert data["earthquake_id"] == test_event.earthquake_id
    assert data["zone_id"] == test_event.zone_id
    assert data["event_intensity"] == test_event.event_intensity
    assert data["event_severity"] == test_event.event_severity


def test_get_event_not_found(client: TestClient):
    """Test getting a non-existing event."""
    response = client.get("/event/9999")
    assert response.status_code == 404


def test_update_event(client: TestClient, test_event: Event):
    """Test updating an event."""
    update_data = {"event_intensity": 6.0}

    response = client.patch(f"/event/{test_event.event_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["event_id"] == test_event.event_id
    assert data["earthquake_id"] == test_event.earthquake_id
    assert data["zone_id"] == test_event.zone_id
    assert data["event_intensity"] == update_data["event_intensity"]
    assert data["event_severity"] == test_event.event_severity


def test_update_event_not_found(client: TestClient):
    """Test updating a non-existing event."""
    update_data = {"event_intensity": 6.0}
    response = client.patch("/event/9999", json=update_data)
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
