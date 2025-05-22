import pytest
from unittest.mock import patch
from fastapi import HTTPException

from app.core.auth import verify_google_token


class TestGoogleTokenVerification:
    @patch("app.core.auth.id_token")
    def test_verify_google_token_valid(self, mock_id_token):
        """Test that a valid token is correctly verified."""
        # Mock the verification response
        mock_idinfo = {
            "iss": "accounts.google.com",
            "sub": "12345",
            "email": "test@example.com",
            "name": "Test User",
        }
        mock_id_token.verify_oauth2_token.return_value = mock_idinfo

        # Call the function with a dummy token
        result = verify_google_token("valid-token")

        # Verify the result
        assert result == mock_idinfo

        # Verify that verify_oauth2_token was called correctly
        mock_id_token.verify_oauth2_token.assert_called_once()
        args, kwargs = mock_id_token.verify_oauth2_token.call_args
        assert kwargs["id_token"] == "valid-token"

    @patch("app.core.auth.id_token")
    def test_verify_google_token_with_https_issuer(self, mock_id_token):
        """Test that a token with 'https://accounts.google.com' issuer is valid."""
        # Mock the verification response with https issuer
        mock_idinfo = {
            "iss": "https://accounts.google.com",
            "sub": "12345",
            "email": "test@example.com",
            "name": "Test User",
        }
        mock_id_token.verify_oauth2_token.return_value = mock_idinfo

        # Call the function with a dummy token
        result = verify_google_token("valid-token")

        # Verify the result
        assert result == mock_idinfo

    @patch("app.core.auth.id_token")
    def test_verify_google_token_wrong_issuer(self, mock_id_token):
        """Test that a token with wrong issuer is rejected."""
        # Mock the verification response with a wrong issuer
        mock_idinfo = {
            "iss": "wrong-issuer.com",
            "sub": "12345",
            "email": "test@example.com",
        }
        mock_id_token.verify_oauth2_token.return_value = mock_idinfo

        # Call the function should raise an HTTPException
        with pytest.raises(HTTPException) as exc_info:
            verify_google_token("invalid-token")

        # Verify the error details
        assert exc_info.value.status_code == 401
        assert "Invalid token" in exc_info.value.detail
        assert "Wrong issuer" in exc_info.value.detail

    @patch("app.core.auth.id_token")
    def test_verify_google_token_verification_error(self, mock_id_token):
        """Test error handling when token verification fails."""
        # Mock id_token.verify_oauth2_token to raise a ValueError
        error_message = "Invalid token structure"
        mock_id_token.verify_oauth2_token.side_effect = ValueError(error_message)

        # Call the function should raise an HTTPException
        with pytest.raises(HTTPException) as exc_info:
            verify_google_token("broken-token")

        # Verify the error details
        assert exc_info.value.status_code == 401
        assert "Invalid token" in exc_info.value.detail
        assert error_message in exc_info.value.detail

    @patch("app.core.auth.id_token")
    @patch("app.core.auth.settings")
    def test_verify_google_token_with_correct_audience(
        self, mock_settings, mock_id_token
    ):
        """Test that the correct audience (client ID) is passed to verification."""
        # Set mock settings
        mock_settings.AUTH_GOOGLE_ID = "test-client-id"

        # Mock successful verification
        mock_idinfo = {
            "iss": "accounts.google.com",
            "sub": "12345",
            "aud": "test-client-id",
            "email": "test@example.com",
        }
        mock_id_token.verify_oauth2_token.return_value = mock_idinfo

        # Call the function
        verify_google_token("valid-token")

        # Verify verify_oauth2_token was called with correct audience
        args, kwargs = mock_id_token.verify_oauth2_token.call_args
        assert kwargs["audience"] == "test-client-id"
