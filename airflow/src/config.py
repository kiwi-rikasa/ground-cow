import os
import sys

from src.service.interval_service import set_interval


class Config:
    def __init__(self):
        self._STATUS = "OK"
        self.AIRFLOW_ACCESS_KEY = os.getenv("AIRFLOW_ACCESS_KEY")
        self.CWA_API_KEY = os.getenv("CWA_API_KEY")
        self.BACKEND_HOST = os.getenv("AIRFLOW_BACKEND_HOST", "http://localhost:8000")
        self.SUPPRESSION_INTERVAL = int(os.getenv("AIRFLOW_SUPPRESSION_INTERVAL", 1800))

        self.AIRFLOW_ACCESS_HEADER = {"x-airflow-key": self.AIRFLOW_ACCESS_KEY}

        set_interval(self.SUPPRESSION_INTERVAL)

        self._validate()

    def _validate(self):
        missing = []
        if not self.AIRFLOW_ACCESS_KEY:
            missing.append("AIRFLOW_ACCESS_KEY")
        if not self.CWA_API_KEY:
            missing.append("CWA_API_KEY")

        if missing:
            print(f"[Startup Error] Missing env vars: {', '.join(missing)}")
            sys.exit(1)


config = Config()
