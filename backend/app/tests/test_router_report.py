import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Alert, Event, Earthquake, User, Report, Zone
from app.models.consts import UserRole, EventSeverity, AlertState


@pytest.fixture
def test_user(db_session: Session):
    """Create a test user for testing."""
    user = User(
        user_email="test@example.com",
        user_name="Test User",
        user_role=UserRole.operator,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


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
def test_report(db_session: Session, test_user: User, test_alert: Alert):
    """Create a test report for testing."""
    report = Report(
        alert_id=test_alert.alert_id,
        user_id=test_user.user_id,
        report_action_flag=False,
        report_damage_flag=False,
        report_factory_zone=test_alert.zone_id,
        report_reported_at=datetime.now(),
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)
    return report


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


@pytest.fixture
def multiple_test_users(db_session: Session):
    users = [
        User(
            user_email=f"test{i}@example.com",
            user_name=f"Test User {i}",
            user_role=UserRole.operator if i % 2 == 0 else UserRole.control,
        )
        for i in range(1, 6)
    ]
    db_session.add_all(users)
    db_session.commit()
    return users


@pytest.fixture
def multiple_test_reports(
    db_session: Session, multiple_test_alerts, multiple_test_users
):
    reports = []
    for alert, user in zip(multiple_test_alerts, multiple_test_users):
        reports.append(
            Report(
                alert_id=alert.alert_id,
                user_id=user.user_id,
                report_action_flag=False,
                report_damage_flag=False,
                report_factory_zone=alert.zone_id,
                report_reported_at=datetime.now(),
            )
        )
    db_session.add_all(reports)
    db_session.commit()
    return reports


def test_create_report(client: TestClient):
    """Test creating a new report."""
    report_data = {
        "alert_id": 1,
        "user_id": 0,
        "report_action_flag": False,
        "report_damage_flag": False,
        "report_factory_zone": 0,
        "report_reported_at": datetime.now().isoformat(),
    }

    response = client.post("/report/", json=report_data)
    assert response.status_code == 200

    data = response.json()
    assert data["alert_id"] == report_data["alert_id"]
    assert data["user_id"] == report_data["user_id"]
    assert data["report_action_flag"] == report_data["report_action_flag"]
    assert data["report_damage_flag"] == report_data["report_damage_flag"]
    assert data["report_factory_zone"] == report_data["report_factory_zone"]
    assert "report_id" in data
    assert "report_reported_at" in data
    assert "report_created_at" in data


def test_list_reports(client: TestClient, test_report: Report):
    """Test listing all reports."""
    response = client.get("/report/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test report is in the list
    report_ids = [report["report_id"] for report in data["data"]]
    assert test_report.report_id in report_ids


def test_list_reports_with_limit_offset(client: TestClient, multiple_test_reports):
    response = client.get("/report/?offset=2&limit=3")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) == 3


def test_list_reports_with_filter(client: TestClient, multiple_test_reports):
    target_report = multiple_test_reports[1]
    response = client.get(f"/report/?alert_id={target_report.alert_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["alert_id"] == target_report.alert_id for e in data)

    response = client.get(f"/report/?user_id={target_report.user_id}")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(e["user_id"] == target_report.user_id for e in data)

    response = client.get(
        f"/report/?report_factory_zone={target_report.report_factory_zone}"
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert all(
        e["report_factory_zone"] == target_report.report_factory_zone for e in data
    )


def test_list_reports_with_sorting(client: TestClient, multiple_test_reports):
    response = client.get("/report/?sort_by=report_reported_at&order=asc")
    assert response.status_code == 200

    data = response.json()["data"]
    assert len(data) > 0

    times = [datetime.fromisoformat(e["report_reported_at"]) for e in data]
    assert times == sorted(times)


def test_get_report(client: TestClient, test_report: Report):
    """Test getting a specific report."""
    response = client.get(f"/report/{test_report.report_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["alert_id"] == test_report.alert_id
    assert data["user_id"] == test_report.user_id
    assert data["report_action_flag"] == test_report.report_action_flag
    assert data["report_damage_flag"] == test_report.report_damage_flag
    assert data["report_factory_zone"] == test_report.report_factory_zone


def test_get_report_not_found(client: TestClient):
    """Test getting a non-existing report."""
    response = client.get("/report/9999")
    assert response.status_code == 404


def test_update_report(client: TestClient, test_report: Report):
    """Test updating a specific report."""
    update_data = {"report_action_flag": True, "report_damage_flag": True}

    response = client.patch(f"/report/{test_report.report_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["report_id"] == test_report.report_id
    assert data["report_action_flag"] == update_data["report_action_flag"]
    assert data["report_damage_flag"] == update_data["report_damage_flag"]
    assert data["alert_id"] == test_report.alert_id
    assert data["user_id"] == test_report.user_id


def test_update_report_not_found(client: TestClient):
    """Test updating a non-existing report."""
    response = client.patch(
        "/report/9999", json={"report_action_flag": True, "report_damage_flag": True}
    )
    assert response.status_code == 404


def test_delete_report(client: TestClient, test_report: Report):
    """Test deleting a specific report."""
    response = client.delete(f"/report/{test_report.report_id}")
    assert response.status_code == 200

    # Verify the report has been deleted
    response = client.get(f"/report/{test_report.report_id}")
    assert response.status_code == 404


def test_delete_report_not_found(client: TestClient):
    """Test deleting a non-existing report."""
    response = client.delete("/report/9999")
    assert response.status_code == 404
