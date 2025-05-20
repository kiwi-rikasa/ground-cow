import logging
import requests

from airflow.models import Variable

from src.config import config
from src.core.zone import Zone

ZONE_CACHE_KEY = "zone_cache"
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


def save_zones(zones: list[Zone]) -> None:
    """
    Save zones to the Airflow Variable cache.

    :param zones: A list of Zone objects to be saved.
    """
    log.info("Saving zones to Airflow Variable...")
    try:
        Variable.set(ZONE_CACHE_KEY, [z.to_dict() for z in zones], serialize_json=True)
    except Exception as e:
        log.error(f"Error saving zones to cache: {e}")
        raise


def get_zones() -> list[Zone]:
    """
    Get zones from Airflow Variable cache or fetch from backend if not available.

    :return zones: A list of Zone data.
    """
    log.info("Getting zones...")
    try:
        zones = Variable.get(ZONE_CACHE_KEY, default_var=None, deserialize_json=True)
        if zones is not None:
            return [Zone.from_dict(z) for z in zones]
    except Exception:
        log.warning("Failed to fetch zones from cache, fetching from backend...")
        pass
    return fetch_zones()
