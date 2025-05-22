import logging

from airflow.models import Variable

from src.core.alert import Alert

log = logging.getLogger(__name__)


def fetch_cached_open_alert(zone_id: int) -> Alert | None:
    """
    Retrieve the most recent open alert for a zone from the Airflow Variable cache.

    :param zone_id: The ID of the zone.
    :return: An Alert object if present, otherwise None.
    """
    log.info("Getting cached open alert from Airflow Variable...")
    try:
        alert = Variable.get(
            f"zone_{zone_id}_open_alert_cache",
            default_var=None,
            deserialize_json=True,
        )
        if not alert:
            return None
        return Alert.from_dict(alert)
    except Exception as e:
        log.error(f"Error getting cached open alert: {e}")
        return None


def save_cached_open_alert(alert: Alert) -> None:
    """
    Save the most recent open alert for a zone to the Airflow Variable cache.

    :param alert: The Alert object to be cached.
    """
    log.info("Saving open alert to Airflow Variable cache...")
    try:
        Variable.set(
            f"zone_{alert.zone_id}_open_alert_cache",
            alert.to_dict(),
            serialize_json=True,
        )
    except Exception as e:
        log.error(f"Error saving open alert to cache: {e}")
        raise
