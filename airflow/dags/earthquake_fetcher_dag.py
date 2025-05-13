from __future__ import annotations
import pendulum
from datetime import datetime
from itertools import product

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.fetch_earthquake import fetch_earthquakes as _fetch_earthquakes
from utils.save_earthquake import save_earthquake

from utils.parse_event import parse_event
from utils.save_event import save_event

from utils.save_alert import save_alert

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
    def group_events(earthquakes, zones):
        return [(zone, earthquakes) for zone in zones]

    @task
    def process_events(data):
        zone, earthquakes = data
        zone_id = zone.get("zone_id")

        raw_events = list(product(earthquakes, [zone]))

        # For each earthquake...
        for raw_event in raw_events:
            # Build
            event = parse_event(raw_event)

            if not event:
                continue

            # Save the event (if exists) to the database
            db_event = save_event(event)
            db_event_id = db_event.get("event_id")

            # Create alert for the event
            alert = {
                "event_id": db_event_id,
                "zone_id": zone_id,
                "timestamp": datetime.now().timestamp(),
                "suppressed_by": None,
            }

            save_alert(alert)

        return

    earthquakes = fetch_earthquakes()
    zones = load_zones()
    by_zone_events = group_events(earthquakes, zones)
    process_events.expand(data=by_zone_events)


earthquake_fetcher_dag()
