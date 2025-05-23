from typing import List, TypedDict


class ZoneStats(TypedDict):
    total_events: str
    alert_activation_rate: str
    damage_rate: str
    alert_completion_rate: str
    alert_suppression_rate: str
    avg_response_time: str


class ZoneEventTrend(TypedDict):
    date: str
    L1: int
    L2: int


class ZoneMagnitudeData(TypedDict):
    bin: str
    count: int


class ZoneIntensityData(TypedDict):
    bin: str
    count: int


class ZoneDashboardResponse(TypedDict):
    zone_stats: ZoneStats
    zone_event_trend: List[ZoneEventTrend]
    zone_magnitude_data: List[ZoneMagnitudeData]
    zone_intensity_data: List[ZoneIntensityData]


class EarthquakeListItem(TypedDict):
    id: int
    label: str


class EarthquakeListResponse(TypedDict):
    earthquakeList: List[EarthquakeListItem]


class EarthquakeEventType(TypedDict):
    type: str
    count: int


class EarthquakeProgress(TypedDict):
    zone: str
    severity: str
    state: str


class EarthquakeDashboardResponse(TypedDict):
    occurrence_time: str
    magnitude: str
    max_intensity: str
    alert_completion_rate: str
    alert_activation_rate: str
    damage_rate: str
    earthquake_event_type: List[EarthquakeEventType]
    earthquake_progress: List[EarthquakeProgress]
