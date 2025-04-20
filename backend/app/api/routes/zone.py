from fastapi import APIRouter, HTTPException
from sqlmodel import select
from ...models.models import Zone
from ...models.schemas.zone import ZoneCreate, ZoneUpdate, ZonePublic, ZonesPublic
from app.api.deps import SessionDep

zone_router = APIRouter()


@zone_router.get("/", response_model=ZonesPublic)
def list_zones(session: SessionDep) -> ZonesPublic:
    """
    Get all zones.
    """
    zones = session.exec(select(Zone)).all()
    return ZonesPublic(data=[ZonePublic.model_validate(zone) for zone in zones])


@zone_router.get("/{zone_id}", response_model=ZonePublic)
def get_zone(zone_id: int, session: SessionDep) -> ZonePublic:
    """
    Get a specific zone by ID.
    """
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone


@zone_router.post("/", response_model=ZonePublic)
def create_zone(zone_in: ZoneCreate, session: SessionDep) -> ZonePublic:
    """
    Create a new zone.
    """
    zone = Zone.model_validate(zone_in)
    session.add(zone)
    session.commit()
    session.refresh(zone)
    return zone


@zone_router.patch("/{zone_id}", response_model=ZonePublic)
def update_zone(
    zone_id: int,
    zone_in: ZoneUpdate,
    session: SessionDep,
) -> ZonePublic:
    """
    Update a zone's information.
    """
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    update_dict = zone_in.model_dump(exclude_unset=True)
    zone.sqlmodel_update(update_dict)

    session.add(zone)
    session.commit()
    session.refresh(zone)
    return zone


@zone_router.delete("/{zone_id}")
def delete_zone(zone_id: int, session: SessionDep) -> dict:
    """
    Delete a zone by ID.
    """
    zone = session.get(Zone, zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    session.delete(zone)
    session.commit()
    return {"message": f"Zone {zone_id} deleted successfully"}
