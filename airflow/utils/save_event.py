import requests
import logging
from typing import Dict

EVENT_API_URL = "http://backend:8000/event"

log = logging.getLogger(__name__)


def save_event(event: Dict[str, str]) -> Dict:
    """
    Save the event data to the database.

    :return event: A dictionary containing the saved event data.
    """

    try:
        payload = {
            "event_intensity": event.get("intensity"),
            "event_severity": event.get("severity"),
            "earthquake_id": event.get("earthquake_id"),
            "zone_id": event.get("zone_id"),
        }
        response = requests.post(EVENT_API_URL, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        log.info(f"Saved event ID {result.get('event_id')} successfully.")
        return result if result else {}
    except Exception as e:
        log.error(f"Error saving event ID {event.get('id')}: {e}")
        raise
