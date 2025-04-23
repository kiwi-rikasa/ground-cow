from fastapi import APIRouter, HTTPException
from sqlmodel import select
from ...models.models import Earthquake
from ...models.schemas.earthquake import (
    EarthquakeCreate,
    EarthquakeUpdate,
    EarthquakePublic,
    EarthquakesPublic,
)
from app.api.deps import SessionDep

earthquake_router = APIRouter()


@earthquake_router.get("/", response_model=EarthquakesPublic)
def list_earthquakes(session: SessionDep) -> EarthquakesPublic:
    """
    Get all earthquakes.
    """
    earthquakes = session.exec(select(Earthquake)).all()
    return EarthquakesPublic(
        data=[EarthquakePublic.model_validate(earthquake) for earthquake in earthquakes]
    )


@earthquake_router.get("/{earthquake_id}", response_model=EarthquakePublic)
def get_earthquake(earthquake_id: int, session: SessionDep) -> EarthquakePublic:
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
def delete_earthquake(earthquake_id: int, session: SessionDep) -> dict:
    """
    Delete a earthquake by ID.
    """
    earthquake = session.get(Earthquake, earthquake_id)
    if not earthquake:
        raise HTTPException(status_code=404, detail="Earthquake not found")

    session.delete(earthquake)
    session.commit()
    return {"message": f"Earthquake {earthquake_id} deleted successfully"}
