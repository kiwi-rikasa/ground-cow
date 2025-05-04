import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from sqlmodel import Session
from app.models.models import Event, Earthquake, Zone
from app.models.consts import EventSeverity


@pytest.fixture
def test_earthquake(db_session: Session):
    """Create a test earthquake for testing."""
    earthquake = Earthquake(
        earthquake_id=2024123123595973998,
        earthquake_magnitude=6.5,
        earthquake_occurred_at=datetime.now() - timedelta(hours=1),
        earthquake_source="Test source",
    )
    db_session.add(earthquake)
    db_session.commit()
    db_session.refresh(earthquake)
    return earthquake


@pytest.fixture
def test_zone(db_session: Session):
    """Create a test zone for testing."""
    zone = Zone(
        zone_name="Test Zone A", zone_note="Test Note 123", zone_regions="Region FDZ"
    )
    db_session.add(zone)
    db_session.commit()
    db_session.refresh(zone)
    return zone


@pytest.fixture
def test_event(db_session: Session, test_earthquake: Earthquake, test_zone: Zone):
    """Create a test event for testing."""
    event = Event(
        earthquake_id=test_earthquake.earthquake_id,
        zone_id=test_zone.zone_id,
        event_intensity=6.5,
        event_severity=EventSeverity.L2,
    )
    db_session.add(event)
    db_session.commit()
    db_session.refresh(event)
    return event


@pytest.fixture
def multiple_test_earthquakes(db_session: Session):
    earthquakes = [
        Earthquake(
            earthquake_id=i,
            earthquake_magnitude=4.7,
            earthquake_occurred_at=datetime.now() - timedelta(hours=1),
            earthquake_source=f"Test source {i}",
        )
        for i in range(16, 21)
    ]
    db_session.add_all(earthquakes)
    db_session.commit()
    return earthquakes


@pytest.fixture
def multiple_test_zones(db_session: Session):
    zones = [
        Zone(
            zone_name=f"Test Zone A{i}",
            zone_note="Test Note 123",
            zone_regions="Region FDZ",
        )
        for i in range(100, 105)
    ]
    db_session.add_all(zones)
    db_session.commit()
    return zones


@pytest.fixture
def multiple_test_events(
    db_session: Session, multiple_test_earthquakes, multiple_test_zones
):
    events = []
    for eq, zone in zip(multiple_test_earthquakes, multiple_test_zones):
        events.append(
            Event(
                earthquake_id=eq.earthquake_id,
                zone_id=zone.zone_id,
                event_intensity=4.7,
                event_severity=EventSeverity.L1,
            )
        )
    db_session.add_all(events)
    db_session.commit()
    return events


def test_create_event(client: TestClient, test_earthquake: Earthquake, test_zone: Zone):
    """Test creating a new event."""
    event_data = {
        "earthquake_id": test_earthquake.earthquake_id,
        "zone_id": test_zone.zone_id,
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


@pytest.mark.parametrize(
    "fk_field, invalid_value",
    [
        ("earthquake_id", 9999),
        ("zone_id", 9999),
    ],
    ids=["invalid_earthquake_id", "invalid_zone_id"],
)
def test_create_event_with_invalid_fk(
    client: TestClient,
    test_earthquake: Earthquake,
    test_zone: Zone,
    fk_field,
    invalid_value,
):
    payload = {
        "earthquake_id": test_earthquake.earthquake_id,
        "zone_id": test_zone.zone_id,
        "event_intensity": 5.0,
        "event_severity": "L1",
    }

    payload[fk_field] = invalid_value

    response = client.post("/event/", json=payload)
    assert response.status_code == 400
    assert fk_field in response.json()["detail"]


def test_list_events(client: TestClient, test_event: Event):
    """Test listing all events."""
    response = client.get("/event/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test event is in the list
    event_ids = [event["event_id"] for event in data["data"]]
    assert test_event.event_id in event_ids


def test_list_events_with_limit_offset(client: TestClient, multiple_test_events):
    response = client.get("/event/?offset=2&limit=3")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) == 3


def test_list_events_with_filter(client: TestClient, multiple_test_events):
    first_event = multiple_test_events[0]

    response = client.get(f"/event/?zone_id={first_event.zone_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["zone_id"] == first_event.zone_id for e in data)

    response = client.get(f"/event/?earthquake_id={first_event.earthquake_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["earthquake_id"] == first_event.earthquake_id for e in data)

    response = client.get(f"/event/?event_severity={first_event.event_severity.value}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["event_severity"] == first_event.event_severity for e in data)


def test_list_events_with_sorting(client: TestClient, multiple_test_events):
    response = client.get("/event/?sort_by=event_created_at&order=asc")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) > 0

    times = [datetime.fromisoformat(e["event_created_at"]) for e in data]
    assert times == sorted(times)


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
