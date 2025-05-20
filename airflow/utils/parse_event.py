from typing import Dict, Tuple

from src.core.zone import Zone

def parse_event(data: Tuple[dict, Zone]) -> Dict[str, str]:
    """
    Parses the event data from the given tuple.

    :param data: A tuple containing the event data.
    :return: A dictionary with parsed event data.
    """
    earthquake, zone = data

    stations = earthquake.get("stations", [])
    region = zone.regions

    station = next((s for s in stations if s.get("id") == region), None)

    magnitude = earthquake.get("magnitude", 0.0)
    intensity = station.get("intensity", 0.0) if station else 0.0
    severity = determine_severity(magnitude, intensity)

    event = {
        "earthquake_id": earthquake.get("id"),
        "zone_id": zone.id,
        "intensity": intensity,
        "severity": severity,
    }

    return event


def determine_severity(magnitude, intensity) -> str:
    if magnitude >= 5.0 or intensity >= 3.0:
        return "L2"
    elif intensity >= 1.0:
        return "L1"
    else:
        return "NA"
