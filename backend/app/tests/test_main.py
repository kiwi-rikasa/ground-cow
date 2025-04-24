from fastapi.testclient import TestClient


def test_app_startup(client: TestClient):
    """Test that the FastAPI application starts up correctly."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}


def test_api_router(client: TestClient):
    """Test that all API routers are registered."""
    # Test user router
    response = client.get("/user/")
    assert response.status_code == 200
    assert "data" in response.json()

    # Test earthquake router
    response = client.get("/earthquake/")
    assert response.status_code == 200
    assert "data" in response.json()

    # Test alert router
    response = client.get("/alert/")
    assert response.status_code == 200
    assert "data" in response.json()

    response = client.get("/event/")
    assert response.status_code == 200
    assert "data" in response.json()

    response = client.get("/zone/")
    assert response.status_code == 200
    assert "data" in response.json()
