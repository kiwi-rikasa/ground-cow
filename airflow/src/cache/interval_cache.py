import logging

from airflow.models import Variable

INTERVAL_CACHE_KEY = "suppression_interval_cache"

log = logging.getLogger(__name__)


def fetch_cached_interval() -> int:
    """
    Get the suppression interval from Airflow Variable cache or fetch from backend if not available.

    :return interval: An integer representing the suppression interval.
    """
    log.info("Getting suppression interval...")
    try:
        interval = Variable.get(
            INTERVAL_CACHE_KEY,
            default_var=None,
            deserialize_json=True,
        )
        if isinstance(interval, int):
            return interval
        log.warning("No valid interval found in cache, using default value.")
        pass
    except Exception:
        log.warning("Failed to fetch interval from cache, using default value.")
        pass
    # Set default interval if cache is empty or invalid
    save_cached_interval(1800)
    return 1800


def save_cached_interval(interval: int) -> None:
    """
    Save suppression interval to the Airflow Variable cache.

    :param interval: An integer representing the suppression interval to be saved.
    """
    log.info("Saving suppression interval to Airflow Variable...")
    try:
        Variable.set(INTERVAL_CACHE_KEY, interval, serialize_json=True)
    except Exception as e:
        log.error(f"Error saving interval to cache: {e}")
        raise
