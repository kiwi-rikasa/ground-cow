from src.core.equake import Earthquake
from src.core.event import Event
from src.core.zone import Zone
from src.data.event_repository import save_event as _save_event


def parse_event(earthquake: Earthquake, zone: Zone) -> Event | None:
    event = Event.from_raw(earthquake, zone)
    return event


def save_event(event: Event) -> dict:
    return _save_event(event)
