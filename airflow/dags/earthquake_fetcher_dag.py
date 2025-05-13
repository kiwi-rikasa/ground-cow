from __future__ import annotations
import pendulum
from itertools import product

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.fetch_earthquake import fetch_earthquakes as _fetch_earthquakes
from utils.save_earthquake import save_earthquake

from utils.parse_event import parse_event
from utils.save_event import save_event

DAG_RUN_INTERVAL = 30  # 30 seconds


@dag(
    dag_id="earthquake_fetcher_dag",
    schedule=f"*/{DAG_RUN_INTERVAL} * * * * *",
    start_date=pendulum.datetime(2025, 5, 1, tz="Asia/Taipei"),
    catchup=False,
    max_active_runs=1,
    tags=["earthquake"],
)
def earthquake_fetcher_dag():
    @task
    def fetch_earthquakes():
        earthquakes = _fetch_earthquakes()

        cached_ids = Variable.get(
            "earthquake_id_cache", default_var=None, deserialize_json=True
        )

        # If no cached earthquake IDs, initialize it to current earthquake IDs
        if cached_ids is None:
            current_ids = [e.get("id") for e in earthquakes]
            Variable.set("earthquake_id_cache", current_ids, serialize_json=True)
            return []

        new_earthquakes = []

        # Check if the earthquake ID already processed
        for index, earthquakes in enumerate(earthquakes):
            if earthquakes.get("id") != cached_ids[index]:
                new_earthquakes.append(earthquakes)
                cached_ids[index] = earthquakes.get("id")

        # Save the new earthquakes to the database
        for earthquake in sorted(new_earthquakes, key=lambda x: x.get("timestamp")):
            save_earthquake(earthquake)

        # Update the variable with the new IDs
        Variable.set("earthquake_id_cache", cached_ids, serialize_json=True)

        return new_earthquakes

    @task
    def load_zones():
        zones = Variable.get("zone_cache", default_var=[], deserialize_json=True)
        if not isinstance(zones, list):
            raise ValueError("Zone pulled from variable is not a list")
        return zones

    @task
    def map_events(earthquakes, zones):
        cross = list(product(earthquakes, zones))
        print("CROSS ___", cross)
        return cross

    @task
    def create_event(event):
        event = parse_event(event)
        event_id = save_event(event).get("event_id", None)
        print(event_id)
        return

    earthquakes = fetch_earthquakes()
    zones = load_zones()
    events = map_events(earthquakes, zones)
    create_event.expand(event=events)


earthquake_fetcher_dag()
