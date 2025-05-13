from __future__ import annotations
import pendulum
from datetime import datetime, timedelta
from itertools import product

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.fetch_earthquake import fetch_earthquakes as _fetch_earthquakes
from utils.save_earthquake import save_earthquake

from utils.parse_event import parse_event
from utils.save_event import save_event

from utils.parse_alert import check_suppression
from utils.save_alert import save_alert


@dag(
    dag_id="earthquake_fetcher_dag",
    schedule=timedelta(seconds=30),
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
        if not earthquakes:
            return []
        return [(zone, earthquakes) for zone in zones]

    @task
    def process_events(data):
        zone, earthquakes = data
        zone_id = zone.get("zone_id")

        raw_events = list(product(earthquakes, [zone]))

        # For each earthquake...
        for raw_event in raw_events:
            # ========== Event ===========
            # Build the event
            event = parse_event(raw_event)

            if not event:
                continue

            # Save the event (if exists) to the database
            db_event = save_event(event)
            db_event_id = db_event.get("event_id")

            # ========== Alert ===========
            # Pre-work: get suppression variables
            suppression_interval = Variable.get(
                "suppression_interval_cache", default_var=1800, deserialize_json=True
            )
            last_unsuppressed_alert = Variable.get(
                f"zone_{zone_id}_last_unsuppressed_alert_cache",
                default_var=None,
                deserialize_json=True,
            )

            alert_time = datetime.now().timestamp()
            # Check if the alert should be suppressed
            # If there is no last unsuppressed alert, it means this is the first alert, which should not be suppressed
            alert_should_suppress = (
                check_suppression(
                    currTime=alert_time,
                    currSeverity=event.get("severity"),
                    prevTime=last_unsuppressed_alert.get("timestamp"),
                    prevSeverity=last_unsuppressed_alert.get("severity"),
                    interval=suppression_interval,
                )
                if last_unsuppressed_alert
                else False
            )

            # Build the alert
            alert = {
                "event_id": db_event_id,
                "zone_id": zone_id,
                "timestamp": alert_time,
                "suppressed_by": (
                    last_unsuppressed_alert.get("alert_id")
                    if alert_should_suppress
                    else None
                ),
            }

            # Save the alert to the database
            db_alert = save_alert(alert)
            db_alert_id = db_alert.get("alert_id")

            # If the alert is not suppressed, update the last unsuppressed alert variable
            if not alert_should_suppress:
                Variable.set(
                    f"zone_{zone_id}_last_unsuppressed_alert_cache",
                    {
                        "alert_id": db_alert_id,
                        "timestamp": alert_time,
                        "severity": event.get("severity"),
                    },
                    serialize_json=True,
                )

        return

    earthquakes = fetch_earthquakes()
    zones = load_zones()
    by_zone_events = group_events(earthquakes, zones)
    process_events.expand(data=by_zone_events)


earthquake_fetcher_dag()
