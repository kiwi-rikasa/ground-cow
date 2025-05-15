from collections.abc import Generator
from typing import Annotated
from fastapi import Depends, HTTPException
from sqlmodel import Session
from app.core.db import engine


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


def say_hi():
    pass
