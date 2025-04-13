import os
import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient
from typing import Generator, Any

# Use SQLite for unit tests
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

# Now import the app after setting environment variables
from app.main import app


@pytest.fixture(scope="session")
def test_db_engine():
    """Create a test database engine."""
    # Use in-memory SQLite for testing
    test_db_url = "sqlite:///:memory:"
    engine = create_engine(
        test_db_url, echo=False, connect_args={"check_same_thread": False}
    )

    # Create all tables in the test database
    SQLModel.metadata.create_all(engine)

    return engine


@pytest.fixture
def db_session(test_db_engine):
    """Create a new database session for each test."""
    connection = test_db_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    # Rollback the transaction and close the connection after each test
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session) -> Generator[TestClient, Any, None]:
    """Create a FastAPI TestClient with dependency overrides."""

    # Override the get_session dependency
    def override_get_session():
        yield db_session

    # Create a copy of the app to avoid side effects between tests
    from app.api.deps import get_db

    app.dependency_overrides[get_db] = override_get_session

    with TestClient(app) as client:
        yield client

    # Remove the override after the test
    app.dependency_overrides = {}
