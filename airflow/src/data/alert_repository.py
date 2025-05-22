import logging
import requests

from src.config import config
from src.core.alert import Alert

ALERT_API_URL = f"{config.BACKEND_HOST}/alert"

log = logging.getLogger(__name__)


def save_alert(alert: Alert) -> tuple[int, dict]:
    """
    Save the alert data to the database.

    :param alert: An Alert object containing the alert data.

    :return: A tuple containing the alert id (int) and the saved alert data (dict).
    """
    log.info("Saving alert to backend...")
    try:
        payload = {
            "event_id": alert.event_id,
            "zone_id": alert.zone_id,
            "alert_alert_time": alert.timestamp,
            "alert_state": "active" if alert.suppressed_by is None else "closed",
            "alert_is_suppressed_by": alert.suppressed_by,
            "alert_severity": str(alert.severity),
        }
        response = requests.post(
            ALERT_API_URL,
            json=payload,
            headers=config.BACKEND_ACCESS_HEADER,
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        id = int(result.get("alert_id"))
        log.info(f"Saved alert #{id} successfully.")
        return id, result
    except Exception as e:
        log.error(f"Error saving alert data: {e}")
        raise
