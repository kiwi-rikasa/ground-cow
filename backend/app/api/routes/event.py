from fastapi import APIRouter, HTTPException
from typing import Optional, Literal
from sqlmodel import select
from ...models.models import Event
from ...models.schemas.event import EventCreate, EventUpdate, EventPublic, EventsPublic
from app.api.deps import SessionDep

event_router = APIRouter()


@event_router.get("/", response_model=EventsPublic)
def list_events(
    session: SessionDep,
    offset: int = 0,
    limit: int = 30,
    zone_id: Optional[int] = None,
    earthquake_id: Optional[int] = None,
    event_severity: Optional[str] = None,
    sort_by: Optional[str] = "event_created_at",
    order: Literal["asc", "desc"] = "desc",
) -> EventsPublic:
    """
    Get specified events.
    """
    query = select(Event)

    if zone_id is not None:
        query = query.where(Event.zone_id == zone_id)
    if earthquake_id is not None:
        query = query.where(Event.earthquake_id == earthquake_id)
    if event_severity is not None:
        query = query.where(Event.event_severity == event_severity)

    if hasattr(Event, sort_by):
        column = getattr(Event, sort_by)
        query = query.order_by(column.asc() if order == "asc" else column.desc())

    events = session.exec(query.offset(offset).limit(limit)).all()
    return EventsPublic(data=[EventPublic.model_validate(event) for event in events])


@event_router.get("/{event_id}", response_model=EventPublic)
def get_event(event_id: int, session: SessionDep) -> EventPublic:
    """
    Get a specific event by ID.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@event_router.post("/", response_model=EventPublic)
def create_event(event_in: EventCreate, session: SessionDep) -> EventPublic:
    """
    Create a new event.
    """
    event = Event.model_validate(event_in)
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@event_router.patch("/{event_id}", response_model=EventPublic)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    session: SessionDep,
) -> EventPublic:
    """
    Update a event's information.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_dict = event_in.model_dump(exclude_unset=True)
    event.sqlmodel_update(update_dict)

    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@event_router.delete("/{event_id}")
def delete_event(event_id: int, session: SessionDep) -> dict:
    """
    Delete a event by ID.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    session.delete(event)
    session.commit()
    return {"message": f"Event {event_id} deleted successfully"}
