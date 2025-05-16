from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException

from app.core.config import settings


def verify_google_token(token: str) -> dict:
    try:
        # Use Google's public certs to verify the token
        idinfo = id_token.verify_oauth2_token(
            id_token=token,
            request=requests.Request(),
            audience=settings.AUTH_GOOGLE_ID,
        )

        if idinfo.get("iss") not in [
            "accounts.google.com",
            "https://accounts.google.com",
        ]:
            raise ValueError("Wrong issuer.")

        return idinfo

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
