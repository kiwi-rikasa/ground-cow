import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Report


@pytest.fixture
def test_report(db_session: Session):
    """Create a test report for testing."""
    report = Report(
        alert_id=0,
        user_id=0,
        report_action_flag=False,
        report_damage_flag=False,
        report_factory_zone=0,
        report_reported_at=datetime.now(),
    )
    db_session.add(report)
    db_session.commit()
    db_session.refresh(report)
    return report


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
