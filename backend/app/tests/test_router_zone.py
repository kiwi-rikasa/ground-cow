import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Zone


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


def test_create_zone(client: TestClient):
    """Test creating a new zone."""
    zone_data = {
        "zone_name": "Zone 52",
        "zone_note": "Nothing but air",
        "zone_regions": "XYZ",
    }

    response = client.post("/zone/", json=zone_data)
    assert response.status_code == 200

    data = response.json()
    assert data["zone_name"] == zone_data["zone_name"]
    assert data["zone_note"] == zone_data["zone_note"]
    assert data["zone_regions"] == zone_data["zone_regions"]
    assert "zone_id" in data
    assert "zone_created_at" in data


def test_list_zones(client: TestClient, test_zone: Zone):
    """Test listing all zones."""
    response = client.get("/zone/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test user is in the list
    zone_ids = [zone["zone_id"] for zone in data["data"]]
    assert test_zone.zone_id in zone_ids


def test_get_zone(client: TestClient, test_zone: Zone):
    """Test getting a specific zone."""
    response = client.get(f"/zone/{test_zone.zone_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["zone_name"] == test_zone.zone_name
    assert data["zone_note"] == test_zone.zone_note
    assert data["zone_regions"] == test_zone.zone_regions
    assert data["zone_id"] == test_zone.zone_id


def test_get_zone_not_found(client: TestClient):
    """Test getting a non-existent zone."""
    response = client.get("/zone/9999")
    assert response.status_code == 404


def test_update_zone(client: TestClient, test_zone: Zone):
    """Test updating a zone."""
    update_data = {"zone_name": "Updated Zone Name"}

    response = client.patch(f"/zone/{test_zone.zone_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["zone_id"] == test_zone.zone_id
    assert data["zone_name"] == update_data["zone_name"]
    assert data["zone_note"] == test_zone.zone_note
    assert data["zone_regions"] == test_zone.zone_regions


def test_update_zone_not_found(client: TestClient):
    """Test updating a non-existent zone."""
    response = client.patch("/zone/9999", json={"zone_name": "Test"})
    assert response.status_code == 404


def test_delete_zone(client: TestClient, test_zone: Zone):
    """Test deleting a zone."""
    response = client.delete(f"/zone/{test_zone.zone_id}")
    assert response.status_code == 200

    # Verify the zone has been deleted
    response = client.get(f"/zone/{test_zone.zone_id}")
    assert response.status_code == 404


def test_delete_zone_not_found(client: TestClient):
    """Test deleting a non-existing zone."""
    response = client.delete("/zone/9999")
    assert response.status_code == 404
