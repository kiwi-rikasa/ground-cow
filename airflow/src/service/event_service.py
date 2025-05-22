from src.config import config
from src.core.equake import Earthquake
from src.core.event import Event
from src.core.severity import Severity
from src.core.zone import Zone
from src.data.event_repository import save_event as _save_event


def parse_event(earthquake: Earthquake, zone: Zone) -> Event | None:
    event = Event.from_raw(earthquake, zone)
    if not config.GENERATE_NA_EVENTS and event.severity == Severity.NA:
        return None
    return event


def save_event(event: Event) -> tuple[int, dict]:
    return _save_event(event)
