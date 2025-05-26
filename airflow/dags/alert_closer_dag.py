import os
from datetime import datetime, timedelta

from airflow.decorators import dag, task

from src.data.alert_repository import get_active_alerts, close_alert

BACKEND_HOST = os.getenv("BACKEND_HOST", "http://localhost:8000")
ALERT_API_URL = f"{BACKEND_HOST}/alert"
ALERT_CLOSURE_THRESHOLD_HOURS = 1


default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email_on_failure": False,
    "email_on_retry": False,
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}


@dag(
    dag_id="alert_closer_dag",
    default_args=default_args,
    description="Automatically closes active alerts older than a specified threshold.",
    schedule_interval=timedelta(hours=1),  # Run every hour
    start_date=datetime(2023, 1, 1),
    catchup=False,
    tags=["alerting"],
)
def alert_closer_dag():
    @task
    def fetch_active_alerts():
        return get_active_alerts()

    @task
    def close_old_alerts_task():
        """
        Fetches active alerts and closes them if they are older than the threshold.
        """
        print("Starting close_old_alerts_task...")

        active_alerts = get_active_alerts()
        print(f"Found {len(active_alerts)} active alerts.")

        if not active_alerts:
            print("No active alerts to process.")
            return

        now = datetime.utcnow()

        for alert in active_alerts:
            alert_id = alert.get("alert_id")
            print(f"Alert {alert_id} created at {alert.get('alert_created_at')}")
            alert_created_at_str = alert.get("alert_created_at")

            if not alert_created_at_str:
                print(f"Alert {alert_id} missing 'alert_created_at', skipping.")
                continue

            try:
                if alert_created_at_str.endswith("Z"):
                    alert_created_at_str = alert_created_at_str[:-1]
                alert_created_at = datetime.fromisoformat(alert_created_at_str)
            except ValueError as e:
                print(
                    f"Error parsing 'alert_created_at' for alert {alert_id}: {alert_created_at_str}. Error: {e}"
                )
                continue

            if now - alert_created_at > timedelta(hours=ALERT_CLOSURE_THRESHOLD_HOURS):
                print(
                    f"Alert {alert_id} created at {alert_created_at} is older than {ALERT_CLOSURE_THRESHOLD_HOURS} hours. Closing."
                )
                close_alert(alert_id)
                print(f"Successfully closed alert {alert_id}.")
            else:
                print(
                    f"Alert {alert_id} created at {alert_created_at} is not old enough to be closed."
                )

        print("Finished close_old_alerts_task.")

    fetch_active_alerts() >> close_old_alerts_task()


alert_closer_dag_instance = alert_closer_dag()
