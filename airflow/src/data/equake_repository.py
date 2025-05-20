import logging
import requests
from concurrent.futures import ThreadPoolExecutor

from src.config import config
from src.core.equake import Earthquake
from src.core.equake_parser import EarthquakeParser

log = logging.getLogger(__name__)


EQUAKE_API_URL = f"{config.BACKEND_HOST}/earthquake"


def fetch_earthquakes() -> list[Earthquake]:
    """
    Fetches earthquake data from both CWA Earthquake APIs in parallel.

    :return earthquakes: A list of earthquake data dictionaries from each endpoint.
    """
    log.info("Fetching earthquake data from CWA API...")
    endpoints = [
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001",
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0016-001",
    ]

    def fetch(endpoint: str) -> Earthquake | None:
        try:
            response = requests.get(
                url=endpoint,
                params={"Authorization": config.CWA_API_KEY, "limit": 1},
                timeout=10,
            )
            response.raise_for_status()
            return EarthquakeParser.parse(response.json())
        except Exception as e:
            log.error(f"Error fetching earthquake data from {endpoint}: {e}")
            raise

    with ThreadPoolExecutor(max_workers=2) as executor:
        earthquakes = list(filter(None, executor.map(fetch, endpoints)))

    return earthquakes


def save_earthquake(earthquake: Earthquake) -> dict:
    """
    Save earthquake data to the database via the backend API.

    :param earthquake: An Earthquake object to be saved.

    :return: The response from the backend API.
    """
    log.info(f"Saving earthquake #{earthquake.id} to backend...")
    try:
        payload = {
            "earthquake_id": earthquake.id,
            "earthquake_occurred_at": earthquake.timestamp,
            "earthquake_magnitude": earthquake.magnitude,
            "earthquake_source": "CWA",
        }
        response = requests.post(
            EQUAKE_API_URL,
            json=payload,
            headers=config.AIRFLOW_ACCESS_HEADER,
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()
        log.info(f"Saved earthquake #{earthquake.id} successfully.")
        return result
    except Exception as e:
        log.error(f"Error saving earthquake data: {e}")
        raise
