import requests
import logging
from typing import Dict

from utils.config import config

BACKEND_HOST = config.BACKEND_HOST
ALERT_API_URL = f"{BACKEND_HOST}/alert"

log = logging.getLogger(__name__)


def save_alert(alert: Dict[str, str]) -> Dict:
    """
    Save the alert data to the database.

    :return alert: A dictionary containing the saved alert data.
    """

    try:
        payload = {
            "event_id": alert.get("event_id"),
            "zone_id": alert.get("zone_id"),
            "alert_alert_time": alert.get("timestamp"),
            "alert_state": "active" if alert.get("suppressed_by") is None else "closed",
            "alert_is_suppressed_by": alert.get("suppressed_by"),
        }
        response = requests.post(ALERT_API_URL, json=payload, timeout=10)
        response.raise_for_status()
        result = response.json()
        log.info(f"Saved alert ID {result.get('alert_id')} successfully.")
        return result if result else {}
    except Exception as e:
        log.error(f"Error saving alert ID {alert.get('id')}: {e}")
        raise
