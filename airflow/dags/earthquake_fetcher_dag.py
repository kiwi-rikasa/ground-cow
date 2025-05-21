from __future__ import annotations
import pendulum
from collections import defaultdict
from datetime import datetime, timedelta
from itertools import product
from typing import TypeAlias

from airflow.decorators import dag, task, task_group

from src.core.alert import Alert
from src.core.equake import Earthquake
from src.core.event import Event
from src.core.zone import Zone
from src.service.alert_service import save_alert, get_open_alert, set_open_alert
from src.service.equake_service import (
    fetch_earthquakes as _fetch_earthquakes,
    save_earthquake,
    get_earthquake_ids,
    set_earthquake_ids,
)
from src.service.event_service import parse_event, save_event
from src.service.interval_service import get_interval
from src.service.zone_service import get_zones as _get_zones


# Type aliases
Incident: TypeAlias = tuple[Event, Alert]


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
    def fetch_and_save_earthquakes() -> list[Earthquake]:
        earthquakes = _fetch_earthquakes()
        cached_ids = get_earthquake_ids()

        # Initialize cached earthquake ids if not exists
        if cached_ids is None:
            set_earthquake_ids([e.id for e in earthquakes])
            return []

        new_earthquakes = [eq for eq in earthquakes if eq.id not in cached_ids]

        for earthquake in sorted(new_earthquakes, key=lambda eq: eq.timestamp):
            save_earthquake(earthquake)

        # Update the earthquake id cache
        set_earthquake_ids([e.id for e in earthquakes])

        return new_earthquakes

    @task
    def get_zones() -> list[Zone]:
        zones = _get_zones()
        return zones

    @task
    def generate_events(
        earthquakes: list[Earthquake],
        zones: list[Zone],
    ) -> list[Event]:
        # Make events for all combinations of earthquakes and zones
        pairs = product(earthquakes, zones)
        events = list(filter(None, [parse_event(eq, z) for eq, z in pairs]))
        return events

    @task
    def generate_alerts(events: list[Event]) -> list[Alert]:
        alerts = [Alert.from_event(ev, datetime.now().timestamp()) for ev in events]
        return alerts

    @task
    def pack_incidents(events: list[Event], alerts: list[Alert]) -> list[Incident]:
        incidents = list(zip(events, alerts))
        return incidents

    @task_group
    def generate_incidents(
        earthquakes: list[Earthquake],
        zones: list[Zone],
    ) -> list[Incident]:
        events = generate_events(earthquakes, zones)
        alerts = generate_alerts(events)
        incidents = pack_incidents(events, alerts)
        return incidents

    @task
    def group_incident_by_zone(incidents: list[Incident]) -> list[list[Incident]]:
        grouped: dict[int, list[Incident]] = defaultdict(list)
        for incident in incidents:
            zone_id = incident[0].zone_id
            grouped[zone_id].append(incident)
        return list(grouped.values())

    @task
    def save_incidents_by_zone(incidents: list[Incident]) -> None:
        for event, alert in incidents:
            # Event
            event.id, _ = save_event(event)

            # Alert
            prev_alert = get_open_alert(alert.zone_id)
            interval = get_interval()
            should_suppress = alert.should_be_suppressed_by(prev_alert, interval)

            alert.event_id = event.id
            alert.suppressed_by = prev_alert.id if should_suppress else None
            alert.id, _ = save_alert(alert)
            if not should_suppress:
                set_open_alert(alert)

    earthquakes = fetch_and_save_earthquakes()
    zones = get_zones()

    incidents = generate_incidents(earthquakes, zones)
    incidents_by_zone = group_incident_by_zone(incidents)

    save_incidents_by_zone.expand(incidents=incidents_by_zone)


earthquake_fetcher_dag()
