import logging

from include.core.zone import Zone
from include.data.zone_repository import fetch_zones as _fetch_zones
from include.cache.zone_cache import fetch_cached_zones, save_cached_zones

log = logging.getLogger(__name__)


def fetch_zones() -> list[Zone]:
    return _fetch_zones()


def get_zones(fresh: bool = False) -> list[Zone]:
    if fresh:
        return fetch_zones()
    return fetch_cached_zones()


def set_zones(zones: list[Zone]) -> None:
    save_cached_zones(zones)
