import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from sqlmodel import Session

from app.api.deps import (
    validate_fk_exists,
    require_session_user,
    require_controller,
    require_admin,
    require_airflow_key,
    get_db,
)
from app.models.models import User
from app.models.consts import UserRole


class TestFkValidation:
    def test_validate_fk_exists_with_missing_fk(self, db_session):
        # Test case for when foreign key doesn't exist
        class TestModel:
            pass

        # Mock session.get to return None
        db_session.get = MagicMock(return_value=None)

        # Verify that an exception is raised
        with pytest.raises(HTTPException) as exc_info:
            validate_fk_exists(db_session, TestModel, 1, "test_fk")

        # Check error details
        assert exc_info.value.status_code == 400
        assert "does not exist" in exc_info.value.detail

    def test_validate_fk_exists_with_none_value(self, db_session):
        # Test case for when foreign key is None
        class TestModel:
            pass

        # This should not raise an exception
        validate_fk_exists(db_session, TestModel, None, "test_fk")

    def test_validate_fk_exists_with_existing_fk(self, db_session):
        # Test case for when foreign key exists
        class TestModel:
            pass

        # Mock session.get to return a mock object (simulating found record)
        mock_record = MagicMock()
        db_session.get = MagicMock(return_value=mock_record)

        # This should not raise an exception and return None
        result = validate_fk_exists(db_session, TestModel, 1, "test_fk")
        assert result is None


class TestUserDependencies:
    @patch("app.api.deps.settings")
    def test_require_session_user_local_env(self, mock_settings, db_session):
        # Test the local environment case
        mock_settings.ENVIRONMENT = "local"
        request = MagicMock()

        user = require_session_user(db_session, request)

        assert user.user_id == 0

    @patch("app.api.deps.settings")
    def test_require_session_user_missing_session(self, mock_settings, db_session):
        # Test case when user is not in session
        mock_settings.ENVIRONMENT = "production"

        # Create mock request with no user_id in session
        request = MagicMock()
        request.session = {}

        # Should raise 401 Unauthorized
        with pytest.raises(HTTPException) as exc_info:
            require_session_user(db_session, request)

        assert exc_info.value.status_code == 401
        assert "Not authenticated" in exc_info.value.detail

    @patch("app.api.deps.settings")
    def test_require_session_user_valid(self, mock_settings, db_session):
        # Test case when user exists in session and database
        mock_settings.ENVIRONMENT = "production"

        # Create mock request with user_id in session
        request = MagicMock()
        request.session = {"user_id": 1}

        # Create mock user
        mock_user = User(user_id=1, user_name="Test User", user_role=UserRole.operator)

        # Mock session.get to return the user
        db_session.get = MagicMock(return_value=mock_user)

        # Call the function
        user = require_session_user(db_session, request)

        # Verify user is returned
        assert user == mock_user

    @patch("app.api.deps.settings")
    def test_require_controller_local_env(self, mock_settings):
        # Test the local environment case
        mock_settings.ENVIRONMENT = "local"

        # Create dummy user (role doesn't matter in local env)
        user = User(user_id=1, user_role=UserRole.operator)

        result = require_controller(user)

        # Should return the user without checking role
        assert result == user

    @patch("app.api.deps.settings")
    def test_require_controller_insufficient_role(self, mock_settings):
        # Test case with insufficient role
        mock_settings.ENVIRONMENT = "production"

        # Create user with operator role
        user = User(user_id=1, user_role=UserRole.operator)

        # Should raise 403 Forbidden
        with pytest.raises(HTTPException) as exc_info:
            require_controller(user)

        assert exc_info.value.status_code == 403
        assert "Controller access required" in exc_info.value.detail

    @patch("app.api.deps.settings")
    def test_require_controller_with_control_role(self, mock_settings):
        # Test case with control role
        mock_settings.ENVIRONMENT = "production"

        # Create user with control role
        user = User(user_id=1, user_role=UserRole.control)

        # Call the function
        result = require_controller(user)

        # Should return the user
        assert result == user

    @patch("app.api.deps.settings")
    def test_require_admin_local_env(self, mock_settings):
        # Test the local environment case
        mock_settings.ENVIRONMENT = "local"

        # Create dummy user (role doesn't matter in local env)
        user = User(user_id=1, user_role=UserRole.operator)

        result = require_admin(user)

        # Should return the user without checking role
        assert result == user

    @patch("app.api.deps.settings")
    def test_require_admin_insufficient_role(self, mock_settings):
        # Test case with insufficient role
        mock_settings.ENVIRONMENT = "production"

        # Create user with control role (not admin)
        user = User(user_id=1, user_role=UserRole.control)

        # Should raise 403 Forbidden
        with pytest.raises(HTTPException) as exc_info:
            require_admin(user)

        assert exc_info.value.status_code == 403
        assert "Admin access required" in exc_info.value.detail

    @patch("app.api.deps.settings")
    def test_require_admin_with_admin_role(self, mock_settings):
        # Test case with admin role
        mock_settings.ENVIRONMENT = "production"

        # Create user with admin role
        user = User(user_id=1, user_role=UserRole.admin)

        # Call the function
        result = require_admin(user)

        # Should return the user
        assert result == user


class TestAirflowAuthentication:
    @patch("app.api.deps.settings")
    def test_require_airflow_key_local_env(self, mock_settings):
        # Test the local environment case
        mock_settings.ENVIRONMENT = "local"
        request = MagicMock()

        result = require_airflow_key(request)

        # Should return True without checking headers
        assert result is True

    @patch("app.api.deps.settings")
    def test_require_airflow_key_missing_header(self, mock_settings):
        # Test case when Airflow key is missing
        mock_settings.ENVIRONMENT = "production"
        mock_settings.AIRFLOW_ACCESS_KEY = "secret-key"

        # Create mock request with no headers
        request = MagicMock()
        request.headers = {}

        # Should raise 403 Forbidden
        with pytest.raises(HTTPException) as exc_info:
            require_airflow_key(request)

        assert exc_info.value.status_code == 403
        assert "Invalid request source" in exc_info.value.detail

    @patch("app.api.deps.settings")
    def test_require_airflow_key_wrong_key(self, mock_settings):
        # Test case when Airflow key is wrong
        mock_settings.ENVIRONMENT = "production"
        mock_settings.AIRFLOW_ACCESS_KEY = "correct-key"

        # Create mock request with wrong key
        request = MagicMock()
        request.headers = {"x-airflow-key": "wrong-key"}

        # Should raise 403 Forbidden
        with pytest.raises(HTTPException) as exc_info:
            require_airflow_key(request)

        assert exc_info.value.status_code == 403
        assert "Invalid request source" in exc_info.value.detail

    @patch("app.api.deps.settings")
    def test_require_airflow_key_correct_key(self, mock_settings):
        # Test case when Airflow key is correct
        mock_settings.ENVIRONMENT = "production"
        mock_settings.AIRFLOW_ACCESS_KEY = "correct-key"

        # Create mock request with correct key
        request = MagicMock()
        request.headers = {"x-airflow-key": "correct-key"}

        result = require_airflow_key(request)

        # Should return True
        assert result is True


# Test for generator function
def test_get_db():
    # Get the generator object
    db_generator = get_db()

    # Get the first yielded value (should be a Session)
    session = next(db_generator)

    # Verify the session is an instance of Session
    assert isinstance(session, Session)

    # Clean up - consume the rest of the generator
    try:
        next(db_generator)
    except StopIteration:
        pass
