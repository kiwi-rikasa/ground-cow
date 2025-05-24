import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from datetime import datetime, timedelta
from app.models.models import Zone, Earthquake, Event, Alert, Report
from app.models.consts import AlertState, EventSeverity


@pytest.fixture
def test_zone(db_session: Session):
    """Create a test zone for testing."""
    zone = Zone(
        zone_name="Test Zone", zone_note="Test Zone Note", zone_regions="Region A"
    )
    db_session.add(zone)
    db_session.commit()
    db_session.refresh(zone)
    return zone


@pytest.fixture
def test_earthquake(db_session: Session):
    """Create a test earthquake for testing."""
    earthquake = Earthquake(
        earthquake_id=2024123456789012345,  # Adding explicit earthquake_id
        earthquake_occurred_at=datetime.now() - timedelta(days=1),
        earthquake_magnitude=5.5,
        earthquake_location="Test Location",
        earthquake_depth=10.0,
        earthquake_source="Test Source",
    )
    db_session.add(earthquake)
    db_session.commit()
    db_session.refresh(earthquake)
    return earthquake


@pytest.fixture
def test_events(db_session: Session, test_earthquake: Earthquake, test_zone: Zone):
    """Create test events for the test earthquake and zone."""
    # Create additional zones to avoid unique constraint issues
    zone2 = Zone(
        zone_name="Test Zone 2", zone_note="Test Zone Note 2", zone_regions="Region B"
    )
    zone3 = Zone(
        zone_name="Test Zone 3", zone_note="Test Zone Note 3", zone_regions="Region C"
    )
    db_session.add(zone2)
    db_session.add(zone3)
    db_session.commit()
    db_session.refresh(zone2)
    db_session.refresh(zone3)

    events = []

    # Create L1 event
    event1 = Event(
        earthquake_id=test_earthquake.earthquake_id,
        zone_id=test_zone.zone_id,
        event_severity=EventSeverity.L1,
        event_intensity=4.5,
        event_created_at=datetime.now() - timedelta(hours=23),
    )

    # Create L2 event with different zone
    event2 = Event(
        earthquake_id=test_earthquake.earthquake_id,
        zone_id=zone2.zone_id,
        event_severity=EventSeverity.L2,
        event_intensity=5.0,
        event_created_at=datetime.now() - timedelta(hours=22),
    )

    # Create NA event with different zone
    event3 = Event(
        earthquake_id=test_earthquake.earthquake_id,
        zone_id=zone3.zone_id,
        event_severity=EventSeverity.NA,
        event_intensity=2.0,
        event_created_at=datetime.now() - timedelta(hours=21),
    )

    db_session.add(event1)
    db_session.add(event2)
    db_session.add(event3)
    db_session.commit()

    db_session.refresh(event1)
    db_session.refresh(event2)
    db_session.refresh(event3)

    events = [event1, event2, event3]
    return events


@pytest.fixture
def test_alerts(db_session: Session, test_events):
    """Create test alerts for the test events."""
    alerts = []

    # Create alert for all events to avoid NoneType error in get_earthquake_progress
    for i, event in enumerate(test_events):
        alert = Alert(
            event_id=event.event_id,
            zone_id=event.zone_id,
            alert_created_at=datetime.now() - timedelta(hours=22, minutes=45 - i * 30),
            alert_is_suppressed_by=None,
            alert_state=AlertState.active if i == 0 else AlertState.resolved,
            alert_alert_time=datetime.now() - timedelta(hours=22, minutes=50 - i * 30),
        )
        db_session.add(alert)
        alerts.append(alert)

    db_session.commit()

    # Refresh all alerts
    for alert in alerts:
        db_session.refresh(alert)

    return alerts


@pytest.fixture
def test_reports(db_session: Session, test_alerts):
    """Create test reports for the test alerts."""
    reports = []

    # Create report for first alert
    report1 = Report(
        alert_id=test_alerts[0].alert_id,
        report_created_at=datetime.now() - timedelta(hours=22, minutes=30),
        report_action_flag=True,
        report_damage_flag=False,
        report_note="Test report 1",
        report_reported_at=datetime.now() - timedelta(hours=22, minutes=30),
    )

    db_session.add(report1)
    db_session.commit()
    db_session.refresh(report1)

    reports = [report1]
    return reports


def test_get_zone_dashboard(
    client: TestClient, test_zone: Zone, test_events, test_alerts, test_reports
):
    """Test getting zone dashboard data."""
    response = client.get(f"/dashboard/zone/{test_zone.zone_id}?weeks=4")
    assert response.status_code == 200

    data = response.json()

    # Check that the expected fields are in the response
    assert "zone_stats" in data
    assert "zone_event_trend" in data
    assert "zone_magnitude_data" in data
    assert "zone_intensity_data" in data

    # Check zone stats content
    stats = data["zone_stats"]
    assert stats["total_events"] == "1"  # Only one event belongs to test_zone
    assert "alert_activation_rate" in stats
    assert "damage_rate" in stats
    assert "alert_completion_rate" in stats
    assert "alert_suppression_rate" in stats
    assert "avg_response_time" in stats

    # Check trends
    assert isinstance(data["zone_event_trend"], list)

    # Check histogram data
    assert isinstance(data["zone_magnitude_data"], list)
    assert isinstance(data["zone_intensity_data"], list)


def test_list_filtered_earthquakes(
    client: TestClient, test_earthquake: Earthquake, test_events
):
    """Test listing filtered earthquakes."""
    response = client.get("/dashboard/earthquake-list")
    assert response.status_code == 200

    data = response.json()

    # Check that the earthquakeList is in the response
    assert "earthquakeList" in data
    assert isinstance(data["earthquakeList"], list)

    # Verify that our test earthquake is in the list
    eq_ids = [eq["id"] for eq in data["earthquakeList"]]
    assert test_earthquake.earthquake_id in eq_ids

    # Check the earthquake label format
    for eq in data["earthquakeList"]:
        if eq["id"] == test_earthquake.earthquake_id:
            expected_label = f"{test_earthquake.earthquake_occurred_at.strftime('%Y-%m-%d %H:%M')} (M{round(test_earthquake.earthquake_magnitude, 1)})"
            assert eq["label"] == expected_label


def test_get_earthquake_dashboard(
    client: TestClient,
    test_earthquake: Earthquake,
    test_events,
    test_alerts,
    test_reports,
):
    """Test getting earthquake dashboard data."""
    response = client.get(
        f"/dashboard/earthquake?earthquake_id={test_earthquake.earthquake_id}"
    )
    assert response.status_code == 200

    data = response.json()

    # Check that the expected fields are in the response
    assert "occurrence_time" in data
    assert "magnitude" in data
    assert "max_intensity" in data
    assert "alert_completion_rate" in data
    assert "alert_activation_rate" in data
    assert "damage_rate" in data
    assert "earthquake_event_type" in data
    assert "earthquake_progress" in data

    # Check earthquake stats
    assert data["magnitude"] == str(round(test_earthquake.earthquake_magnitude, 1))
    assert float(data["max_intensity"]) == 5.0  # Should be the max from our events

    # Check event types
    event_types = {et["type"]: et["count"] for et in data["earthquake_event_type"]}
    assert "L1" in event_types
    assert "L2" in event_types
    assert event_types["L1"] == 1
    assert event_types["L2"] == 1

    # Check progress data
    assert isinstance(data["earthquake_progress"], list)
    assert len(data["earthquake_progress"]) > 0

    # Each progress item should have zone, severity and state
    for progress in data["earthquake_progress"]:
        assert "zone" in progress
        assert "severity" in progress
        assert "state" in progress


def test_get_earthquake_dashboard_with_weeks(
    client: TestClient, test_events, test_alerts, test_reports
):
    """Test getting earthquake dashboard data using weeks parameter."""
    response = client.get("/dashboard/earthquake?weeks=4")
    assert response.status_code == 200

    data = response.json()

    # Check that the expected fields are in the response
    assert "occurrence_time" in data
    assert "magnitude" in data
    assert "max_intensity" in data
    assert "earthquake_event_type" in data
    assert "earthquake_progress" in data


def test_get_earthquake_dashboard_invalid_params(client: TestClient):
    """Test getting earthquake dashboard with invalid parameters."""
    # Both earthquake_id and weeks set to -1 (invalid)
    response = client.get("/dashboard/earthquake?earthquake_id=-1&weeks=-1")
    assert response.status_code == 400

    # Both earthquake_id and weeks provided (invalid)
    response = client.get("/dashboard/earthquake?earthquake_id=1&weeks=4")
    assert response.status_code == 400
