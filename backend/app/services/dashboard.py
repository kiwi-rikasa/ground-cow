from typing import List, Tuple
from collections import defaultdict
from datetime import datetime, timedelta
from ..models.models import Event, Alert, Report
from ..models.schemas.dashboard import (
    EarthquakeProgress,
    EarthquakeEventType,
    EarthquakeDashboardResponse,
    ZoneStats,
    ZoneEventTrend,
    ZoneMagnitudeData,
    ZoneIntensityData,
)


def get_zone_stats(
    events: List[Event], alerts: List[Alert], reports: List[Report]
) -> ZoneStats:
    """
    Summarize key indicators for a specific zone.
    """
    total_events = len(events)
    action_rate = (
        sum(r.report_action_flag for r in reports) / len(reports) if reports else 0
    )
    damage_rate = (
        sum(r.report_damage_flag for r in reports) / len(reports) if reports else 0
    )
    alert_completion_rate = len(reports) / len(alerts) if alerts else 0
    alert_suppression_rate = (
        sum(1 for a in alerts if a.alert_is_suppressed_by) / len(alerts)
        if alerts
        else 0
    )

    alert_map = {a.alert_id: a for a in alerts}
    total_response_time = sum(
        (r.report_created_at - alert_map[r.alert_id].alert_created_at).total_seconds()
        for r in reports
        if r.alert_id in alert_map
    )
    avg_response_time = total_response_time / len(reports) if reports else 0

    return {
        "total_events": str(total_events),
        "alert_activation_rate": f"{round(action_rate * 100)}%",
        "damage_rate": f"{round(damage_rate * 100)}%",
        "alert_completion_rate": f"{round(alert_completion_rate * 100)}%",
        "alert_suppression_rate": f"{round(alert_suppression_rate * 100)}%",
        "avg_response_time": f"{int(avg_response_time // 60)}m {int(avg_response_time % 60)}s",
    }


def get_zone_event_trend(events: List[Event], weeks: int) -> List[ZoneEventTrend]:
    """
    Generate weekly L1/L2 event trend data for the zone dashboard.
    """
    today = datetime.now().date()
    trend = {}

    week_starts = [
        today - timedelta(days=7 * (i + 1) - 1) for i in reversed(range(weeks))
    ]

    for start in week_starts:
        trend[start] = {"L1": 0, "L2": 0}

    for e in events:
        e_date = e.event_created_at.date()
        for start in week_starts:
            end = start + timedelta(days=6)
            if start <= e_date <= end:
                if e.event_severity == "L1":
                    trend[start]["L1"] += 1
                elif e.event_severity == "L2":
                    trend[start]["L2"] += 1
                break

    def format_range(start_date):
        end_date = start_date + timedelta(days=6)
        return f"{start_date.month}/{start_date.day} - {end_date.month}/{end_date.day}"

    return [{"date": format_range(week), **trend[week]} for week in sorted(trend)]


def build_histogram(
    data: List[float], bins: List[Tuple[float, float]]
) -> List[ZoneMagnitudeData]:
    """
    Create histogram data from a list of values using predefined bins.
    """
    result = []
    for low, high in bins:
        label = f"{low}-{high}" if high != float("inf") else f"{low}+"
        count = sum(low <= v < high for v in data)
        result.append({"bin": label, "count": count})
    return result


def get_zone_histograms(
    events: List[Event],
) -> Tuple[List[ZoneMagnitudeData], List[ZoneIntensityData]]:
    """
    Generate magnitude and intensity histograms for a list of events.
    """
    intensity_bins = [
        (0.0, 1.0),
        (1.0, 2.0),
        (2.0, 3.0),
        (3.0, 4.0),
        (4.0, 5.0),
        (5.0, 6.0),
        (6.0, 7.0),
    ]
    magnitude_bins = [
        (0.0, 2.0),
        (2.0, 3.0),
        (3.0, 4.0),
        (4.0, 5.0),
        (5.0, 6.0),
        (6.0, 7.0),
        (7.0, float("inf")),
    ]

    intensity_data = [e.event_intensity for e in events]
    magnitude_data = [e.earthquake.earthquake_magnitude for e in events if e.earthquake]

    return (
        build_histogram(intensity_data, intensity_bins),
        build_histogram(magnitude_data, magnitude_bins),
    )


def get_earthquake_stats(
    events: List[Event], alerts: List[Alert], reports: List[Report]
) -> EarthquakeDashboardResponse:
    """
    Summarize key indicators for a specific earthquake.
    """
    e = events[0].earthquake
    occurrence_time = e.earthquake_occurred_at.strftime("%Y-%m-%d %H:%M")
    magnitude = round(e.earthquake_magnitude, 1)
    intensity = max(ev.event_intensity for ev in events)

    completion_rate = len(reports) / len(alerts) if alerts else 0
    action_rate = (
        sum(r.report_action_flag for r in reports) / len(reports) if reports else 0
    )
    damage_rate = (
        sum(r.report_damage_flag for r in reports) / len(reports) if reports else 0
    )

    return {
        "occurrence_time": occurrence_time,
        "magnitude": str(magnitude),
        "max_intensity": str(intensity),
        "alert_completion_rate": f"{round(completion_rate * 100)}%",
        "alert_activation_rate": f"{round(action_rate * 100)}%",
        "damage_rate": f"{round(damage_rate * 100)}%",
    }


def get_earthquake_event_type(events: List[Event]) -> List[EarthquakeEventType]:
    """
    Count the number of L1 and L2 events for a specific earthquake.
    """
    counter = defaultdict(int)
    for e in events:
        if e.event_severity in ("L1", "L2"):
            counter[e.event_severity] += 1
    return [{"type": k, "count": v} for k, v in sorted(counter.items())]


def get_earthquake_progress(
    events: List[Event], alerts: List[Alert]
) -> List[EarthquakeProgress]:
    """
    List the alert state and severity for each zone affected by the earthquake.
    """
    alert_map = {a.event_id: a for a in alerts}
    progress = []
    for e in events:
        a = alert_map.get(e.event_id)
        progress.append(
            {
                "zone": e.zone.zone_name,
                "severity": e.event_severity,
                "state": a.alert_state,
            }
        )
    return progress
