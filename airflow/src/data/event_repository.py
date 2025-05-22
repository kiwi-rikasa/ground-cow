import logging
import requests

from src.config import config
from src.core.event import Event

EVENT_API_URL = f"{config.BACKEND_HOST}/event"

log = logging.getLogger(__name__)


def save_event(event: Event) -> tuple[int, dict]:
    """
    Save the event data to the database.

    :param event: An Event object containing the event data.

    :return: A tuple containing the event id (int) and the saved event data (dict).
    """
    log.info("Saving event to backend...")
    try:
        payload = {
            "earthquake_id": event.earthquake_id,
            "zone_id": event.zone_id,
            "event_intensity": event.intensity,
            "event_severity": str(event.severity),
        }
        response = requests.post(
            EVENT_API_URL,
            json=payload,
            headers=config.AIRFLOW_ACCESS_HEADER,
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        id = int(result.get("event_id"))
        log.info(f"Saved event #{id} successfully.")
        return id, result
    except Exception as e:
        log.error(f"Error saving event data: {e}")
        raise
