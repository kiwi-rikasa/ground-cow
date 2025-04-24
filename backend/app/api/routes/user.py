from fastapi import APIRouter, HTTPException
from typing import Optional
from sqlmodel import select
from ...models.models import User
from ...models.schemas.user import UserCreate, UserUpdate, UserPublic, UsersPublic
from app.api.deps import SessionDep

user_router = APIRouter()


@user_router.get("/", response_model=UsersPublic)
def list_users(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    user_role: Optional[str] = None,
) -> UsersPublic:
    """
    Get all users.
    """
    query = select(User)

    if user_role is not None:
        query = query.where(User.user_role == user_role)

    users = session.exec(query.offset(offset).limit(limit)).all()
    return UsersPublic(data=[UserPublic.model_validate(user) for user in users])


@user_router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: int, session: SessionDep) -> UserPublic:
    """
    Get a specific user by ID.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@user_router.post("/", response_model=UserPublic)
def create_user(user_in: UserCreate, session: SessionDep) -> UserPublic:
    """
    Create a new user.
    """
    user = User.model_validate(user_in)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@user_router.patch("/{user_id}", response_model=UserPublic)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    session: SessionDep,
) -> UserPublic:
    """
    Update a user's information.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = user_in.model_dump(exclude_unset=True)
    user.sqlmodel_update(update_dict)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@user_router.delete("/{user_id}")
def delete_user(user_id: int, session: SessionDep) -> dict:
    """
    Delete a user by ID.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"message": f"User {user_id} deleted successfully"}
