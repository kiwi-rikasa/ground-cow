import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from sqlmodel import select

from app.api.routes.session import create_session, delete_session
from app.models.models import User
from app.models.consts import UserRole


@pytest.fixture
def mock_request():
    """Create a mock request object with a session dictionary."""
    request = MagicMock()
    request.session = {}
    return request


@pytest.fixture
def mock_valid_token_payload():
    """Create a mock token input payload."""

    class TokenPayload:
        id_token = "valid-token"

    return TokenPayload()


class TestSessionRoutes:
    @patch("app.api.routes.session.verify_google_token")
    def test_create_session_existing_user(
        self, mock_verify_token, mock_request, db_session, mock_valid_token_payload
    ):
        """Test creating a session for an existing user."""
        # Setup mock for Google token verification
        mock_verify_token.return_value = {
            "email": "existing@example.com",
            "name": "Existing User",
        }

        # Create an existing user in the test database
        existing_user = User(
            user_email="existing@example.com",
            user_name="Existing User",
            user_role=UserRole.operator,
        )
        db_session.add(existing_user)
        db_session.commit()
        db_session.refresh(existing_user)

        # Call the create_session function
        response = create_session(mock_valid_token_payload, mock_request, db_session)

        # Verify that the user was found and not created again
        assert response.user_email == "existing@example.com"
        assert response.user_name == "Existing User"

        # Verify that the user ID was stored in the session
        assert mock_request.session["user_id"] == existing_user.user_id

        # Verify that no new user was created
        users_count = db_session.exec(select(User)).all()
        assert len(users_count) == 1

    @patch("app.api.routes.session.verify_google_token")
    def test_create_session_new_user(
        self, mock_verify_token, mock_request, db_session, mock_valid_token_payload
    ):
        """Test creating a session for a new user."""
        # Setup mock for Google token verification
        mock_verify_token.return_value = {
            "email": "new@example.com",
            "name": "New User",
        }

        # Call the create_session function
        response = create_session(mock_valid_token_payload, mock_request, db_session)

        # Verify that a new user was created with correct information
        assert response.user_email == "new@example.com"
        assert response.user_name == "New User"
        assert response.user_role == UserRole.operator

        # Verify that the user ID was stored in the session
        assert mock_request.session["user_id"] is not None

        # Verify that a new user was created in the database
        new_user = db_session.exec(
            select(User).where(User.user_email == "new@example.com")
        ).first()
        assert new_user is not None
        assert new_user.user_name == "New User"

    @patch("app.api.routes.session.verify_google_token")
    def test_create_session_missing_email(
        self, mock_verify_token, mock_request, db_session, mock_valid_token_payload
    ):
        """Test error handling when email is missing from token."""
        # Setup mock for Google token verification with missing email
        mock_verify_token.return_value = {
            "name": "Invalid User"
            # Email is missing
        }

        # Attempt to create a session should raise an HTTPException
        with pytest.raises(HTTPException) as exc_info:
            create_session(mock_valid_token_payload, mock_request, db_session)

        # Verify error details
        assert exc_info.value.status_code == 400
        assert "Email not found" in exc_info.value.detail

    @patch("app.api.routes.session.verify_google_token")
    def test_create_session_missing_name(
        self, mock_verify_token, mock_request, db_session, mock_valid_token_payload
    ):
        """Test handling when name is missing from token."""
        # Setup mock for Google token verification with missing name
        mock_verify_token.return_value = {
            "email": "noname@example.com"
            # Name is missing
        }

        # Call the create_session function
        response = create_session(mock_valid_token_payload, mock_request, db_session)

        # Verify that the name is derived from the email
        assert response.user_name == "noname"

        # Verify that a user was created
        user = db_session.exec(
            select(User).where(User.user_email == "noname@example.com")
        ).first()
        assert user is not None
        assert user.user_name == "noname"

    def test_delete_session(self):
        """Test logout functionality."""
        # Create a mock request with a session that we can monitor
        mock_request = MagicMock()
        mock_request.session = MagicMock()
        mock_request.session["user_id"] = 123

        # Call the delete_session function
        response = delete_session(mock_request)

        # Verify that the session was cleared
        mock_request.session.clear.assert_called_once()

        # Verify response message
        assert response["message"] == "Logged out"
