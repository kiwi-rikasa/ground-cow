from __future__ import annotations
import pendulum
from datetime import datetime, timedelta
from itertools import product

from airflow.decorators import dag, task
from airflow.models import Variable

from src.core.alert import Alert
from src.core.equake import Earthquake
from src.core.zone import Zone
from src.service.alert_service import save_alert, get_open_alert, set_open_alert
from src.service.equake_service import (
    fetch_earthquakes as _fetch_earthquakes,
    save_earthquake,
    get_earthquake_ids,
    set_earthquake_ids,
)
from src.service.event_service import parse_event, save_event
from src.service.zone_service import get_zones


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
        zones = get_zones()
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
            db_event_id = int(db_event.get("event_id"))

            # ========== Alert ===========
            # Pre-work: get suppression variables
            suppression_interval = Variable.get(
                "suppression_interval_cache", default_var=1800, deserialize_json=True
            )

            alert = Alert(
                event_id=db_event_id,
                zone_id=zone_id,
                timestamp=datetime.now().timestamp(),
                severity=event.severity,
            )

            prev_open_alert = get_open_alert(zone_id)
            suppress_flag = (
                alert.should_be_suppressed_by(prev_open_alert, suppression_interval)
                if prev_open_alert
                else False
            )
            if suppress_flag:
                alert.suppressed_by = int(prev_open_alert.id)

            # Save the alert to the database
            db_alert = save_alert(alert)
            alert.id = int(db_alert.get("alert_id"))

            # If the alert is not suppressed, update the last unsuppressed alert variable
            if not suppress_flag:
                set_open_alert(alert)
        return

    earthquakes = fetch_earthquakes()
    zones = load_zones()
    by_zone_events = group_events(earthquakes, zones)
    process_events.expand(data=by_zone_events)


earthquake_fetcher_dag()
