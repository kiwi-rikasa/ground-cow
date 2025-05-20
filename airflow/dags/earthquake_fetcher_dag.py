from __future__ import annotations
import pendulum
from datetime import datetime, timedelta
from itertools import product

from airflow.decorators import dag, task
from airflow.models import Variable

from utils.parse_alert import check_suppression
from utils.save_alert import save_alert

from src.core.zone import Zone
from src.core.equake import Earthquake
from src.service.equake_service import (
    fetch_earthquakes as _fetch_earthquakes,
    save_earthquake,
    get_earthquake_ids,
    set_earthquake_ids,
)
from src.service.event_service import parse_event, save_event
from src.service.zone_service import provide_zones


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
    def fetch_earthquakes() -> list[Earthquake]:
        earthquakes = _fetch_earthquakes()
        cached_ids = get_earthquake_ids()

        # Initialize cached earthquake ids if not exists
        if cached_ids is None:
            set_earthquake_ids([e.id for e in earthquakes])
            return []

        # Filter out new earthquakes
        new_earthquakes = [eq for eq in earthquakes if eq.id not in cached_ids]

        # Save the new earthquakes in order of their timestamps to the database
        for earthquake in sorted(new_earthquakes, key=lambda eq: eq.timestamp):
            save_earthquake(earthquake)

        # Update the earthquake id cache
        set_earthquake_ids([e.id for e in earthquakes])

        return new_earthquakes

    @task
    def load_zones() -> list[Zone]:
        zones = provide_zones()
        return zones

    @task
    def group_events(
        earthquakes: list[Earthquake],
        zones: list[Zone],
    ) -> list[tuple[Zone, list[Earthquake]]]:
        if not earthquakes:
            return []
        return [(zone, earthquakes) for zone in zones]

    @task
    def process_events(data: tuple[Zone, list[Earthquake]]) -> None:
        zone, earthquakes = data
        zone_id = zone.id

        raw_events = list(product(earthquakes, [zone]))

        # For each earthquake...
        for earthquake, zone in raw_events:
            # ========== Event ===========
            # Build the event
            event = parse_event(earthquake, zone)

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
                    currSeverity=str(event.severity),
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
                        "severity": str(event.severity),
                    },
                    serialize_json=True,
                )

        return

    earthquakes = fetch_earthquakes()
    zones = load_zones()
    by_zone_events = group_events(earthquakes, zones)
    process_events.expand(data=by_zone_events)


earthquake_fetcher_dag()
