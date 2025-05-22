import logging
import requests

from src.config import config
from src.core.zone import Zone

ZONE_API_URL = f"{config.BACKEND_HOST}/zone"

log = logging.getLogger(__name__)


def fetch_zones() -> list[Zone]:
    """
    Fetch zones from the backend API.

    :return zones: A list of fetched Zone objects.
    """
    log.info("Fetching zone data from backend...")
    try:
        response = requests.get(ZONE_API_URL, timeout=10)
        response.raise_for_status()
        zones = response.json().get("data", [])
        return [Zone(z.get("zone_id"), z.get("zone_regions")) for z in zones]
    except Exception as e:
        log.error(f"Error fetching zone data: {e}")
        raise
