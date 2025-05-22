import logging

from src.cache.interval_cache import fetch_cached_interval, save_cached_interval

log = logging.getLogger(__name__)


def get_interval() -> int:
    return fetch_cached_interval()


def set_interval(interval: int) -> None:
    save_cached_interval(interval)
