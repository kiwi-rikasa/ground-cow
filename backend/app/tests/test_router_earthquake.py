import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import Earthquake


@pytest.fixture
def test_earthquake(db_session: Session):
    """Create a test earthquake for testing."""
    earthquake = Earthquake(
        earthquake_id=2024123123595973999,
        earthquake_magnitude=7.3,
        earthquake_occurred_at=datetime.now() - timedelta(hours=1),
        earthquake_source="Test source",
    )
    db_session.add(earthquake)
    db_session.commit()
    db_session.refresh(earthquake)
    return earthquake


@pytest.fixture
def multiple_test_earthquakes(db_session: Session):
    earthquakes = [
        Earthquake(
            earthquake_id=i,
            earthquake_magnitude=i + 2.5,
            earthquake_occurred_at=datetime.now() - timedelta(hours=1),
            earthquake_source=f"Test source {i}",
        )
        for i in range(5)
    ]
    db_session.add_all(earthquakes)
    db_session.commit()
    return earthquakes


def test_create_earthquake(client: TestClient):
    """Test creating a new earthquake."""
    earthquake_data = {
        "earthquake_id": 2025010100000040001,
        "earthquake_magnitude": 6.1,
        "earthquake_occurred_at": datetime.now().isoformat(),
        "earthquake_source": "Seismo Lab",
    }

    response = client.post("/earthquake/", json=earthquake_data)
    assert response.status_code == 200
    data = response.json()
    assert data["earthquake_id"] == earthquake_data["earthquake_id"]
    assert data["earthquake_magnitude"] == earthquake_data["earthquake_magnitude"]
    assert data["earthquake_source"] == earthquake_data["earthquake_source"]
    assert "earthquake_occurred_at" in data
    assert "earthquake_created_at" in data


def test_list_earthquakes(client: TestClient, test_earthquake: Earthquake):
    """Test listing all earthquakes."""
    response = client.get("/earthquake/")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    earthquake_ids = [e["earthquake_id"] for e in data["data"]]
    assert test_earthquake.earthquake_id in earthquake_ids


def test_list_earthquakes_with_limit_offset(
    client: TestClient, multiple_test_earthquakes
):
    response = client.get("/earthquake/?offset=1&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 3


def test_list_earthquakes_with_sorting(client: TestClient, multiple_test_earthquakes):
    response = client.get("/earthquake/?sort_by=earthquake_created_at&order=asc")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0
    times = [datetime.fromisoformat(e["earthquake_created_at"]) for e in data]
    assert times == sorted(times)


def test_get_earthquake(client: TestClient, test_earthquake: Earthquake):
    """Test getting a specific earthquake."""
    response = client.get(f"/earthquake/{test_earthquake.earthquake_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["earthquake_id"] == test_earthquake.earthquake_id
    assert data["earthquake_magnitude"] == test_earthquake.earthquake_magnitude
    assert data["earthquake_source"] == test_earthquake.earthquake_source


def test_get_earthquake_not_found(client: TestClient):
    """Test getting a non-existing earthquake."""
    response = client.get("/earthquake/0000000000000000000")
    assert response.status_code == 404


def test_update_earthquake(client: TestClient, test_earthquake: Earthquake):
    """Test updating an earthquake."""
    update_data = {"earthquake_magnitude": 7.0}
    response = client.patch(
        f"/earthquake/{test_earthquake.earthquake_id}", json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["earthquake_magnitude"] == update_data["earthquake_magnitude"]


def test_update_earthquake_not_found(client: TestClient):
    """Test updating a non-existing earthquake."""
    response = client.patch(
        "/earthquake/0000000000000000000", json={"earthquake_magnitude": 7.0}
    )
    assert response.status_code == 404


def test_delete_earthquake(client: TestClient, test_earthquake: Earthquake):
    """Test deleting an earthquake."""
    response = client.delete(f"/earthquake/{test_earthquake.earthquake_id}")
    assert response.status_code == 200

    # Verify it was deleted
    response = client.get(f"/earthquake/{test_earthquake.earthquake_id}")
    assert response.status_code == 404


def test_delete_earthquake_not_found(client: TestClient):
    """Test deleting a non-existing earthquake."""
    response = client.delete("/earthquake/0000000000000000000")
    assert response.status_code == 404
