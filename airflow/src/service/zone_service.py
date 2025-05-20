import logging

from src.core.zone import Zone
from src.data.zone_repository import fetch_zones, get_zones

log = logging.getLogger(__name__)


def provide_zones(fresh: bool = False) -> list[Zone]:
    """
    Provide zones either from cache or by fetching from the backend.

    :param fresh: If `True`, fetch zones from the backend regardless of cache.

    :return: A list of Zone objects.
    """
    log.info("Providing zones...")
    if fresh:
        return fetch_zones()
    return get_zones()
