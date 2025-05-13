import re
from datetime import datetime
from typing import Optional, List, Dict, Any


class EquakeDataParser:
    """Parses earthquake data from a structured dictionary."""

    _INTENSITY_MAP = {
        "0級": 0.0,
        "1級": 1.0,
        "2級": 2.0,
        "3級": 3.0,
        "4級": 4.0,
        "5弱": 5.0,
        "5強": 5.5,
        "6弱": 6.0,
        "6強": 6.5,
        "7級": 7.0,
    }

    def __init__(self, data: Dict[str, Any]):
        """
        Takes raw data and prepares the first available earthquake entry.
        """
        self._entry = data.get("records", {}).get("Earthquake", [{}])[0]

    def get_equake_id(self) -> str:
        """
        Returns the earthquake's unique 19-digit ID.
        """
        url = self._entry.get("ReportImageURI", "")
        match = re.search(r"/(\d+)_H\.png$", url)
        return int(match.group(1)[:19].ljust(19, "0") if match else "0" * 19)

    def get_equake_timestamp(self) -> int:
        """
        Returns the time the earthquake occurred as a Unix timestamp.
        """
        time_str = self._entry.get("EarthquakeInfo", {}).get("OriginTime", "")
        try:
            return int(datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S").timestamp())
        except ValueError:
            return 0

    def get_equake_magnitude(self) -> float:
        """
        Returns the magnitude of the earthquake.
        """
        return (
            self._entry.get("EarthquakeInfo", {})
            .get("EarthquakeMagnitude", {})
            .get("MagnitudeValue", 0.0)
        )

    def get_stations(self) -> List[Dict[str, Any]]:
        """
        Returns a flat list of all seismic stations that recorded the event.
        """
        areas = self._entry.get("Intensity", {}).get("ShakingArea", [])
        return [station for area in areas for station in area.get("EqStation", [])]

    def get_station_id(self, station: Dict[str, Any]) -> Optional[str]:
        """
        Returns the ID of a given station.
        """
        return station.get("StationID")

    def get_station_location(self, station: Dict[str, Any]) -> Optional[tuple]:
        """
        Returns the latitude and longitude of a given station.
        """
        latitude = station.get("StationLatitude")
        longitude = station.get("StationLongitude")
        return (
            (latitude, longitude)
            if latitude is not None and longitude is not None
            else None
        )

    def get_station_intensity(self, station: Dict[str, Any]) -> Optional[float]:
        """
        Returns the intensity at a station as a numeric value.
        """
        intensity_label = station.get("SeismicIntensity")
        return self._INTENSITY_MAP.get(intensity_label)
