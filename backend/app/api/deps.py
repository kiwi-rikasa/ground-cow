from collections.abc import Generator
from typing import Annotated
from fastapi import Depends, HTTPException, Request
from sqlmodel import Session
from app.core.db import engine
from app.core.config import settings
from app.models.models import User
from app.models.consts import UserRole


def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]


def validate_fk_exists(
    session: Session, model: type, fk_value: int | None, fk_name: str
) -> None:
    """Validate that a foreign key exists in the target table."""
    if fk_value is None:
        return
    if not session.get(model, fk_value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid foreign key '{fk_name}': record with ID {fk_value} does not exist.",
        )


def get_session_user_id(request: Request) -> int:
    """
    Get the user ID from the session.

    - In local development, skip checking and return a dummy user ID `0`.
    - In real application, it is the user ID from the session.
    """
    # In local environment, skip checking
    if settings.ENVIRONMENT == "local":
        return 0
    # In real application, use user id from the session
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id


def get_session_user(
    session: SessionDep,
    user_id: int = Depends(get_session_user_id),
) -> User:
    """
    Get the user corresponding to the user ID from the session.

    - In local development, skip checking and return a dummy user.
    - In real application, check if the user exists in the database.
    """
    # In local environment, skip checking
    if settings.ENVIRONMENT == "local":
        return User(user_id=user_id)
    # In real application, get user using the user_id from the session
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


def require_admin(user: User = Depends(get_session_user)) -> User:
    """
    Verify that the current user is an admin.

    - In local development, skip checking.
    - In real application, check if the user is an admin.
    """
    # In local environment, skip checking
    if settings.ENVIRONMENT == "local":
        return user
    # In real application, check if the user is an admin
    if user.user_role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
