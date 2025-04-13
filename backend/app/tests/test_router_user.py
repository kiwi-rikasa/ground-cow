import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.models import User
from app.models.consts import UserRole


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


def test_create_user(client: TestClient):
    """Test creating a new user."""
    user_data = {
        "user_email": "new@example.com",
        "user_name": "New User",
        "user_role": "operator",
    }

    response = client.post("/user/", json=user_data)
    assert response.status_code == 200

    data = response.json()
    assert data["user_email"] == user_data["user_email"]
    assert data["user_name"] == user_data["user_name"]
    assert data["user_role"] == user_data["user_role"]
    assert "user_id" in data
    assert "user_created_at" in data


def test_list_users(client: TestClient, test_user: User):
    """Test listing all users."""
    response = client.get("/user/")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data

    # Check if our test user is in the list
    user_ids = [user["user_id"] for user in data["data"]]
    assert test_user.user_id in user_ids


def test_get_user(client: TestClient, test_user: User):
    """Test getting a specific user."""
    response = client.get(f"/user/{test_user.user_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["user_id"] == test_user.user_id
    assert data["user_email"] == test_user.user_email
    assert data["user_name"] == test_user.user_name
    assert data["user_role"] == test_user.user_role


def test_get_user_not_found(client: TestClient):
    """Test getting a non-existent user."""
    response = client.get("/user/9999")
    assert response.status_code == 404


def test_update_user(client: TestClient, test_user: User):
    """Test updating a user."""
    update_data = {"user_name": "Updated Name"}

    response = client.patch(f"/user/{test_user.user_id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["user_id"] == test_user.user_id
    assert data["user_name"] == update_data["user_name"]
    assert data["user_email"] == test_user.user_email  # Email should remain unchanged


def test_update_user_not_found(client: TestClient):
    """Test updating a non-existent user."""
    response = client.patch("/user/9999", json={"user_name": "Test"})
    assert response.status_code == 404


def test_delete_user(client: TestClient, test_user: User):
    """Test deleting a user."""
    response = client.delete(f"/user/{test_user.user_id}")
    assert response.status_code == 200

    # Verify the user has been deleted
    response = client.get(f"/user/{test_user.user_id}")
    assert response.status_code == 404


def test_delete_user_not_found(client: TestClient):
    """Test deleting a non-existent user."""
    response = client.delete("/user/9999")
    assert response.status_code == 404
