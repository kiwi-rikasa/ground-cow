import requests
import logging

from src.config import config

BACKEND_HOST = config.BACKEND_HOST
ZONE_API_URL = f"{BACKEND_HOST}/zone"

log = logging.getLogger(__name__)


def fetch_zones() -> list[dict[str, str]]:
    """
    Fetches zone data from backend API.

    :return zones: the list of zone data
    """
    log.info("Fetching zone data from backend...")
    try:
        # Make a GET request to the backend API
        response = requests.get(ZONE_API_URL, timeout=10)
        response.raise_for_status()
        zones = response.json().get("data", [])

        # Return the formatted list of zones
        return [
            {"zone_id": zone.get("zone_id"), "zone_regions": zone.get("zone_regions")}
            for zone in zones
        ]

    except Exception as e:
        log.error(f"Error fetching zone data: {e}")
        raise
