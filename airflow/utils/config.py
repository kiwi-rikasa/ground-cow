import os
import sys


class Config:
    def __init__(self):
        self._STATUS = "OK"
        self.AIRFLOW_ACCESS_KEY = os.getenv("AIRFLOW_ACCESS_KEY")
        self.CWA_API_KEY = os.getenv("CWA_API_KEY")
        self.BACKEND_HOST = os.getenv("AIRFLOW_BACKEND_HOST") or "http://localhost:8000"

        self.AIRFLOW_ACCESS_HEADER = {"x-airflow-key": self.AIRFLOW_ACCESS_KEY}

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
