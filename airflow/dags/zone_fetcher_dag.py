from __future__ import annotations
from datetime import timedelta
import pendulum

from airflow.decorators import dag, task

from src.core.zone import Zone
from src.data.zone_repository import fetch_zones as _fetch_zones, save_zones


@dag(
    dag_id="zone_fetcher_dag",
    schedule=timedelta(minutes=10),
    start_date=pendulum.datetime(2025, 5, 1, tz="Asia/Taipei"),
    catchup=False,
    max_active_runs=1,
    tags=["zone"],
)
def zone_fetcher_dag():
    @task
    def fetch_zones() -> list[Zone]:
        zones = _fetch_zones()
        return zones

    @task
    def cache_zones(zones: list[Zone]) -> None:
        save_zones(zones)

    zones = fetch_zones()
    cache_zones(zones)


zone_fetcher_dag()
