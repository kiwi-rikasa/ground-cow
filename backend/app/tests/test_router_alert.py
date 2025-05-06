import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Alert, Earthquake, Event, Zone
from app.models.consts import AlertState, EventSeverity


@pytest.fixture
def test_earthquake(db_session: Session):
    """Create a test earthquake for testing."""
    earthquake = Earthquake(
        earthquake_id=2024123123595973995,
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
def test_alert(db_session: Session, test_event: Event):
    """Create a test alert for testing."""
    alert = Alert(
        event_id=test_event.event_id,
        zone_id=test_event.zone_id,
        alert_alert_time=datetime.now(),
        alert_state=AlertState.active,
    )
    db_session.add(alert)
    db_session.commit()
    db_session.refresh(alert)
    return alert


@pytest.fixture
def multiple_test_earthquakes(db_session: Session):
    earthquakes = [
        Earthquake(
            earthquake_id=i,
            earthquake_magnitude=4.7,
            earthquake_occurred_at=datetime.now() - timedelta(hours=1),
            earthquake_source=f"Test source {i}",
        )
        for i in range(255, 260)
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
        for i in range(200, 205)
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


@pytest.fixture
def multiple_test_alerts(db_session: Session, multiple_test_events):
    alerts = []
    for event in multiple_test_events:
        alerts.append(
            Alert(
                event_id=event.event_id,
                zone_id=event.zone_id,
                alert_alert_time=datetime.now(),
                alert_state=AlertState.active,
            )
        )
    db_session.add_all(alerts)
    db_session.commit()
    return alerts


def test_create_alert(
    client: TestClient, test_event: Event, test_zone: Zone, test_alert: Alert
):
    """Test creating a new alert."""
    alert_data = {
        "event_id": test_event.event_id,
        "zone_id": test_zone.zone_id,
        "alert_alert_time": datetime.now().isoformat(),
        "alert_state": "active",
        "alert_is_suppressed_by": test_alert.alert_id,
    }

    response = client.post("/alert/", json=alert_data)
    assert response.status_code == 200

    data = response.json()
    assert data["event_id"] == alert_data["event_id"]
    assert data["alert_state"] == alert_data["alert_state"]
    assert data["alert_is_suppressed_by"] == alert_data["alert_is_suppressed_by"]
    assert "alert_id" in data
    assert "alert_created_at" in data


@pytest.mark.parametrize(
    "fk_field, invalid_value",
    [
        ("event_id", 9999),
        ("zone_id", 9999),
        ("alert_is_suppressed_by", 9999),
    ],
    ids=["invalid_event_id", "invalid_zone_id", "invalid_alert_is_suppressed_by"],
)
def test_create_alert_with_invalid_foreign_keys(
    client: TestClient, test_event: Event, test_zone: Zone, fk_field, invalid_value
):
    payload = {
        "event_id": test_event.event_id,
        "zone_id": test_zone.zone_id,
        "alert_alert_time": datetime.now().isoformat(),
        "alert_state": "active",
        "alert_is_suppressed_by": None,
    }
    payload[fk_field] = invalid_value

    response = client.post("/alert/", json=payload)
    assert response.status_code == 400
    assert fk_field in response.json()["detail"]


def test_list_alerts(client: TestClient, test_alert: Alert):
    """Test listing all alerts."""
    response = client.get("/alert/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test alert is in the list
    alert_ids = [alert["alert_id"] for alert in data["data"]]
    assert test_alert.alert_id in alert_ids


def test_list_alerts_with_limit_offset(client: TestClient, multiple_test_alerts):
    response = client.get("/alert/?offset=2&limit=3")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) == 3


def test_list_alerts_with_filter(client: TestClient, multiple_test_alerts):
    first_alert = multiple_test_alerts[0]

    response = client.get(f"/alert/?alert_state={first_alert.alert_state.value}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["alert_state"] == first_alert.alert_state for e in data)

    response = client.get(f"/alert/?zone_id={first_alert.zone_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["zone_id"] == first_alert.zone_id for e in data)


def test_list_alerts_with_sorting(client: TestClient, multiple_test_alerts):
    response = client.get("/alert/?sort_by=alert_created_at&order=asc")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) > 0

    times = [datetime.fromisoformat(e["alert_created_at"]) for e in data]
    assert times == sorted(times)


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
