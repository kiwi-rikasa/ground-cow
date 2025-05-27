from __future__ import annotations
import json
import time
from datetime import datetime

from airflow.decorators import dag, task, task_group
from airflow.models.param import Param
from airflow.utils.dates import days_ago

from include.core.alert import Alert
from include.core.equake import Earthquake
from include.core.event import Event
from include.core.simulation import SimulationData
from include.core.zone import Zone
from include.service.alert_service import save_alert, get_open_alert, set_open_alert
from include.service.equake_service import save_earthquake as _save_earthquake
from include.service.event_service import parse_event, save_event
from include.service.interval_service import get_interval
from include.service.zone_service import get_zones as _get_zones


@dag(
    dag_id="earthquake_simulator_dag",
    schedule_interval=None,
    start_date=days_ago(1),
    catchup=False,
    max_active_runs=1,
    params={"data": Param("[]", type="string")},
    tags=["zone"],
)
def earthquake_simulator_dag():
    @task
    def get_params(params: dict) -> list[any]:
        return json.loads(params["data"])

    @task
    def get_zones() -> list[Zone]:
        return _get_zones()

    @task
    def generate_earthquakes(data: list[dict]) -> list[Earthquake]:
        return SimulationData.from_raw(data).earthquakes

    @task
    def wait_until_earthquake_occur(earthquake: Earthquake) -> None:
        while datetime.now().timestamp() < earthquake.timestamp:
            time.sleep(1)

    @task
    def save_earthquake(earthquake: Earthquake) -> Earthquake:
        _save_earthquake(earthquake)
        return earthquake

    @task_group
    def process_events(earthquake: Earthquake, zones: list[Zone]) -> list[Event]:
        @task
        def generate_events(earthquake: Earthquake, zones: list[Zone]) -> list[Event]:
            events = [parse_event(earthquake, z) for z in zones]
            return list(filter(None, events))

        @task
        def save_events(events: list[Event]) -> list[Event]:
            for event in events:
                event.id, _ = save_event(event)
            return events

        events = generate_events(earthquake, zones)
        events = save_events(events)
        return events

    @task_group
    def process_alerts(events: list[Event]) -> list[Alert]:
        @task
        def generate_alerts(events: list[Event]) -> list[Alert]:
            alerts = [Alert.from_event(e, datetime.now().timestamp()) for e in events]
            return alerts

        @task
        def save_alerts(alerts: list[Alert]) -> list[Alert]:
            for alert in alerts:
                prev_alert = get_open_alert(alert.zone_id)
                interval = get_interval()
                should_suppress = alert.should_be_suppressed_by(prev_alert, interval)
                alert.suppressed_by = prev_alert.id if should_suppress else None
                alert.id, _ = save_alert(alert)
                if not should_suppress:
                    set_open_alert(alert)
            return alerts

        alerts = generate_alerts(events)
        alerts = save_alerts(alerts)
        return alerts

    @task_group
    def simulate(earthquake: Earthquake, zones: list[Zone]):
        _wait = wait_until_earthquake_occur(earthquake)
        equake = save_earthquake(earthquake)
        events = process_events(equake, zones)
        alerts = process_alerts(events)

        _wait >> equake >> events >> alerts

    data = get_params()
    zones = get_zones()
    earthquakes = generate_earthquakes(data)

    simulate.partial(zones=zones).expand(earthquake=earthquakes)


earthquake_simulator_dag()
