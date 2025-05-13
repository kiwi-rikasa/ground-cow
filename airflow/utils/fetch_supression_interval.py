import requests
import logging

SUPPRESSION_INTERVAL_API_URL = "http://backend:8000/placeholder"

log = logging.getLogger(__name__)


def fetch_interval() -> list[dict[str, str]]:
    """
    Fetches suppression interval from backend API.

    :return interval: a number representing the suppression interval in seconds
    """
    log.info("Fetching suppression interval from backend...")
    try:
        # Make a GET request to the backend API
        # response = requests.get(SUPPRESSION_INTERVAL_API_URL, timeout=10)
        # response.raise_for_status()
        # interval = response.json().get("interval", 1800)  # Default to 30 minutes if not provided

        # Fake data for testing
        interval = 1800

        return interval

    except Exception as e:
        log.error(f"Error fetching suppression interval: {e}")
        raise
