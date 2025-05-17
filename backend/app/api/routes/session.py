from fastapi import APIRouter, Request, HTTPException
from sqlmodel import select
from pydantic import BaseModel

from app.core.auth import verify_google_token
from app.models.consts import UserRole
from app.models.models import User
from app.models.schemas.user import UserPublic
from app.api.deps import SessionDep

session_router = APIRouter()


class TokenInput(BaseModel):
    id_token: str  # Google OAuth2 id token from frontend


@session_router.post("/", response_model=UserPublic)
def create_session(
    payload: TokenInput,
    request: Request,
    session: SessionDep,
):
    """
    Signs in a user using a Google OAuth2 id token.

    If the user already exists in the database, logs them in.
    Otherwise, registers a new user with a default role.
    """

    # Step 1: Verify the id token with Google
    google_user = verify_google_token(payload.id_token)

    # Step 2: Extract required user info
    email = google_user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found")

    # Step 3: Try to find the user in the database
    user = session.exec(select(User).where(User.user_email == email)).first()

    # Step 4: Create the user if they don't exist
    if not user:
        user = User(
            user_email=email,
            user_name=google_user.get("name") or email.split("@")[0],
            user_role=UserRole.operator,
        )
        session.add(user)
        session.commit()
        session.refresh(user)

    # Step 5: Store user ID in session cookie
    request.session["user_id"] = user.user_id

    return UserPublic.model_validate(user)


@session_router.delete("/")
def delete_session(request: Request):
    """
    Logout the user by clearing the session.
    """
    request.session.clear()
    return {"message": "Logged out"}
