from __future__ import annotations
import pendulum

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.fetch_supression_interval import fetch_interval as _fetch_interval

DAG_RUN_INTERVAL = 10  # 10 minutes


@dag(
    dag_id="suppression_interval_fetcher_dag",
    schedule=f"*/{DAG_RUN_INTERVAL} * * * *",
    start_date=pendulum.datetime(2025, 5, 1, tz="Asia/Taipei"),
    catchup=False,
    max_active_runs=1,
    tags=["suppression"],
)
def suppression_interval_fetcher_dag():
    @task
    def fetch_interval():
        interval = _fetch_interval()
        return interval

    @task
    def cache_interval(interval):
        if not isinstance(interval, int):
            raise ValueError("Suppression interval is not an integer")
        Variable.set("suppression_interval_cache", interval, serialize_json=True)
        return

    interval = fetch_interval()
    cache_interval(interval)


suppression_interval_fetcher_dag()
