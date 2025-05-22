import logging

from airflow.models import Variable

from src.core.zone import Zone
from src.data.zone_repository import fetch_zones

ZONE_CACHE_KEY = "zone_cache"

log = logging.getLogger(__name__)


def fetch_cached_zones() -> list[Zone]:
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


def save_cached_zones(zones: list[Zone]) -> None:
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
