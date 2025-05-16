from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Literal
from sqlmodel import select
from ...models.models import Earthquake, User
from ...models.schemas.earthquake import (
    EarthquakeCreate,
    EarthquakeUpdate,
    EarthquakePublic,
    EarthquakesPublic,
)
from app.api.deps import SessionDep, require_session_user, require_controller

earthquake_router = APIRouter()


@earthquake_router.get("/", response_model=EarthquakesPublic)
def list_earthquakes(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    sort_by: Optional[str] = "earthquake_occurred_at",
    order: Literal["asc", "desc"] = "desc",
    _: User = Depends(require_session_user),
) -> EarthquakesPublic:
    """
    Get all earthquakes.
    """
    query = select(Earthquake)

    if hasattr(Earthquake, sort_by):
        column = getattr(Earthquake, sort_by)
        query = query.order_by(column.asc() if order == "asc" else column.desc())

    earthquakes = session.exec(query.offset(offset).limit(limit)).all()
    return EarthquakesPublic(
        data=[EarthquakePublic.model_validate(earthquake) for earthquake in earthquakes]
    )


@earthquake_router.get("/{earthquake_id}", response_model=EarthquakePublic)
def get_earthquake(
    earthquake_id: int,
    session: SessionDep,
    _: User = Depends(require_session_user),
) -> EarthquakePublic:
    """
    Get a specific earthquake by ID.
    """
    earthquake = session.get(Earthquake, earthquake_id)
    if not earthquake:
        raise HTTPException(status_code=404, detail="Earthquake not found")
    return earthquake


@earthquake_router.post("/", response_model=EarthquakePublic)
def create_earthquake(
    earthquake_in: EarthquakeCreate, session: SessionDep
) -> EarthquakePublic:
    """
    Create a new earthquake.
    """
    earthquake = Earthquake.model_validate(earthquake_in)
    session.add(earthquake)
    session.commit()
    session.refresh(earthquake)
    return earthquake


@earthquake_router.patch("/{earthquake_id}", response_model=EarthquakePublic)
def update_earthquake(
    earthquake_id: int,
    earthquake_in: EarthquakeUpdate,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> EarthquakePublic:
    """
    Update a earthquake's information.
    """
    earthquake = session.get(Earthquake, earthquake_id)
    if not earthquake:
        raise HTTPException(status_code=404, detail="Earthquake not found")

    update_dict = earthquake_in.model_dump(exclude_unset=True)
    earthquake.sqlmodel_update(update_dict)

    session.add(earthquake)
    session.commit()
    session.refresh(earthquake)
    return earthquake


@earthquake_router.delete("/{earthquake_id}")
def delete_earthquake(
    earthquake_id: int,
    session: SessionDep,
    _: User = Depends(require_controller),
) -> dict:
    """
    Delete a earthquake by ID.
    """
    earthquake = session.get(Earthquake, earthquake_id)
    if not earthquake:
        raise HTTPException(status_code=404, detail="Earthquake not found")

    session.delete(earthquake)
    session.commit()
    return {"message": f"Earthquake {earthquake_id} deleted successfully"}
