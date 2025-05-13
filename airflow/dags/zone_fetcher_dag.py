from __future__ import annotations
import pendulum

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.fetch_zones import fetch_zones as _fetch_zones

DAG_RUN_INTERVAL = 10  # 10 minutes


@dag(
    dag_id="zone_fetcher_dag",
    schedule=f"*/{DAG_RUN_INTERVAL} * * * *",
    start_date=pendulum.datetime(2025, 5, 1, tz="Asia/Taipei"),
    catchup=False,
    max_active_runs=1,
    tags=["zone"],
)
def zone_fetcher_dag():
    @task
    def fetch_zones():
        zones = _fetch_zones()
        return zones

    @task
    def cache_zones(zones):
        if not isinstance(zones, list):
            raise ValueError("Zones pulled from XCom is not a list.")
        Variable.set("zone_cache", zones, serialize_json=True)
        return

    zones = fetch_zones()
    cache_zones(zones)


zone_fetcher_dag()
