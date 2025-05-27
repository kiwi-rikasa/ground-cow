import logging

from airflow.models import Variable

EQUAKE_ID_CACHE_KEY = "equake_id_cache"

log = logging.getLogger(__name__)


def fetch_cached_earthquake_ids() -> list[int] | None:
    """
    Get cached earthquake IDs from Airflow Variable.

    :return: A list of cached earthquake IDs, or an empty list if not set.
    """
    log.info("Getting cached earthquake IDs from Airflow Variable...")
    try:
        ids = Variable.get(
            EQUAKE_ID_CACHE_KEY,
            default_var=None,
            deserialize_json=True,
        )
        return ids
    except Exception as e:
        log.error(f"Error getting cached earthquake IDs: {e}")
        return []


def save_cached_earthquake_ids(ids: list[int]) -> None:
    """
    Save earthquake IDs to Airflow Variable cache.

    :param ids: A list of earthquake IDs to be cached.
    """
    log.info("Saving earthquake IDs to Airflow Variable cache...")
    try:
        Variable.set(
            EQUAKE_ID_CACHE_KEY,
            ids,
            serialize_json=True,
        )
    except Exception as e:
        log.error(f"Error saving earthquake IDs to cache: {e}")
        raise
