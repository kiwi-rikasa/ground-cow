from src.core.equake import Earthquake
from src.cache.equake_cache import (
    fetch_cached_earthquake_ids,
    save_cached_earthquake_ids,
)
from src.data.equake_repository import (
    fetch_earthquakes as _fetch_earthquakes,
    save_earthquake as _save_earthquake,
)


def fetch_earthquakes() -> list[Earthquake]:
    return _fetch_earthquakes()


def save_earthquake(earthquake) -> tuple[int, dict]:
    return _save_earthquake(earthquake)


def get_earthquake_ids() -> list[int] | None:
    return fetch_cached_earthquake_ids()


def set_earthquake_ids(ids: list[int]) -> None:
    save_cached_earthquake_ids(ids)
