from concurrent.futures import ThreadPoolExecutor
import requests
import logging
import os

from utils.parse_earthquake import EquakeDataParser

log = logging.getLogger(__name__)


def fetch_earthquake(endpoint: str) -> dict[str, str]:
    """
    Fetches the latest earthquake data from the CWA API.

    :return earthquake: A dictionary containing the latest earthquake data.
    """
    # Load environment variables from .env file
    if not os.environ.get("CWA_APIKEY"):
        raise EnvironmentError("Please set the CWA_APIKEY env variable.")

    log.info(f"Fetching the latest earthquake data from {endpoint}...")
    try:
        # Make a GET request to the CWA Earthquake API
        response = requests.get(
            url=endpoint,
            params={"Authorization": os.environ.get("CWA_APIKEY"), "limit": 1},
            timeout=10,
        )
        response.raise_for_status()
        result = response.json()

        # Parse the result
        parser = EquakeDataParser(result)

        # Return the formatted earthquake data
        return {
            "id": parser.get_equake_id(),
            "timestamp": parser.get_equake_timestamp(),
            "magnitude": parser.get_equake_magnitude(),
            "stations": [
                {
                    "id": parser.get_station_id(station),
                    "location": parser.get_station_location(station),
                    "intensity": parser.get_station_intensity(station),
                }
                for station in parser.get_stations()
            ],
        }

    except Exception as e:
        log.error(f"Error fetching earthquake data: {e}")
        raise


def fetch_earthquakes() -> list[dict[str, str]]:
    """
    Fetches earthquake data from both CWA Earthquake APIs in parallel.

    :return results: A list of earthquake data dictionaries from each endpoint.
    """
    endpoints = [
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001",
        "https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0016-001",
    ]
    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(fetch_earthquake, endpoints))

    return results
