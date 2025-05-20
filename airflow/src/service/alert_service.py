from src.core.alert import Alert
from src.cache.alert_cache import fetch_cached_open_alert, save_cached_open_alert
from src.data.alert_repository import save_alert as _save_alert


def save_alert(alert: Alert) -> dict:
    return _save_alert(alert)


def get_open_alert(zone_id: int) -> Alert | None:
    return fetch_cached_open_alert(zone_id)


def set_open_alert(alert: Alert) -> None:
    save_cached_open_alert(alert)
