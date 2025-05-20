import requests
import logging

from src.config import config

BACKEND_HOST = config.BACKEND_HOST
EARTHQUAKE_API_URL = f"{BACKEND_HOST}/earthquake"

log = logging.getLogger(__name__)


def save_earthquake(earthquake: dict[str, str]) -> None:
    """
    Fetches the latest earthquake data from the CWA API.

    :return earthquake: A dictionary containing the latest earthquake data.
    """

    try:
        payload = {
            "earthquake_id": earthquake.get("id"),
            "earthquake_occurred_at": earthquake.get("timestamp"),
            "earthquake_magnitude": earthquake.get("magnitude"),
            "earthquake_source": "CWA",
        }
        response = requests.post(
            EARTHQUAKE_API_URL,
            json=payload,
            headers=config.AIRFLOW_ACCESS_HEADER,
            timeout=10,
        )
        response.raise_for_status()
        log.info(f"Saved earthquake ID {earthquake.get('id')} successfully.")
        return response.json()
    except Exception as e:
        log.error(f"Error saving earthquake ID {earthquake.get('id')}: {e}")
        raise
