import os
import sys

from include.service.interval_service import set_interval


class Config:
    def __init__(self):
        self._STATUS = "OK"

        # Backend access: Host
        self.BACKEND_HOST = os.getenv("AIRFLOW_BACKEND_HOST", "http://localhost:8000")
        # Backend access: Access key header
        self.BACKEND_ACCESS_NAME = os.getenv("AIRFLOW_ACCESS_NAME", "x-airflow-key")
        self.BACKEND_ACCESS_KEY = os.getenv("AIRFLOW_ACCESS_KEY")
        self.BACKEND_ACCESS_HEADER = {self.BACKEND_ACCESS_NAME: self.BACKEND_ACCESS_KEY}

        # CWA API key
        self.CWA_API_KEY = os.getenv("CWA_API_KEY")

        # Event: Whether to generate NA-serverity events
        self.GENERATE_NA_EVENTS = os.getenv("GENERATE_NA_EVENTS", "false").lower() == "true"

        # Alert: Suppression interval
        self.SUPPRESSION_INTERVAL = int(os.getenv("ALERT_SUPPRESSION_INTERVAL", 1800))
        set_interval(self.SUPPRESSION_INTERVAL)

        self._validate()

    def _validate(self):
        missing = []
        if not self.BACKEND_ACCESS_KEY:
            missing.append("AIRFLOW_ACCESS_KEY")
        if not self.CWA_API_KEY:
            missing.append("CWA_API_KEY")

        if missing:
            print(f"[Startup Error] Missing env vars: {', '.join(missing)}")
            sys.exit(1)


config = Config()
