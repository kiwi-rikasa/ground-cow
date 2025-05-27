from include.config import config
from include.core.equake import Earthquake
from include.core.event import Event
from include.core.severity import Severity
from include.core.zone import Zone
from include.data.event_repository import save_event as _save_event


def parse_event(earthquake: Earthquake, zone: Zone) -> Event | None:
    event = Event.from_raw(earthquake, zone)
    if not config.GENERATE_NA_EVENTS and event.severity == Severity.NA:
        return None
    return event


def save_event(event: Event) -> tuple[int, dict]:
    return _save_event(event)
