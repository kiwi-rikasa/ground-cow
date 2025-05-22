import re
from datetime import datetime

from src.core.equake import Earthquake, Station


class EarthquakeParser:
    """
    Parses earthquake data from a structured dictionary.
    """

    def __init__(self, data: dict[str, any]):
        """
        Takes raw data and prepares the first available earthquake entry.
        """
        self._entry = data.get("records", {}).get("Earthquake", [{}])[0]

    def get_earthquake_id(self) -> str:
        """
        Returns the earthquake's unique 19-digit ID.
        """
        url = self._entry.get("ReportImageURI", "")
        match = re.search(r"/(\d+)_H\.png$", url)
        return int(match.group(1)[:19].ljust(19, "0") if match else "0" * 19)

    def get_earthquake_timestamp(self) -> int:
        """
        Returns the time the earthquake occurred as a Unix timestamp.
        """
        time_str = self._entry.get("EarthquakeInfo", {}).get("OriginTime", "")
        try:
            return int(datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S").timestamp())
        except ValueError:
            return 0

    def get_earthquake_magnitude(self) -> float:
        """
        Returns the magnitude of the earthquake.
        """
        return (
            self._entry.get("EarthquakeInfo", {})
            .get("EarthquakeMagnitude", {})
            .get("MagnitudeValue", 0.0)
        )

    def get_stations(self) -> list[dict[str, any]]:
        """
        Returns a flat list of all seismic stations that recorded the event.
        """
        areas = self._entry.get("Intensity", {}).get("ShakingArea", [])
        return [station for area in areas for station in area.get("EqStation", [])]

    @classmethod
    def parse(cls, data: dict[str, any]) -> Earthquake:
        """
        Parses the earthquake dictionary and returns an Earthquake object.
        """
        parser = cls(data)
        return Earthquake(
            id=parser.get_earthquake_id(),
            timestamp=parser.get_earthquake_timestamp(),
            magnitude=parser.get_earthquake_magnitude(),
            stations=[StationParser.parse(s) for s in parser.get_stations()],
        )


class StationParser:
    """
    Parses seismic station data from a structured dictionary.
    """

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

    def __init__(self, data: dict[str, any]):
        """
        Takes raw data and prepares the first available earthquake entry.
        """
        self._entry = data

    def get_station_id(self) -> str:
        """
        Returns the ID of the station.
        """
        return self._entry.get("StationID")

    def get_station_location(self) -> tuple:
        """
        Returns the latitude and longitude of the station.
        """
        latitude = self._entry.get("StationLatitude")
        longitude = self._entry.get("StationLongitude")
        return (
            (latitude, longitude)
            if latitude is not None and longitude is not None
            else None
        )

    def get_station_intensity(self) -> float:
        """
        Returns the intensity at the station as a numeric value.
        """
        intensity_label = self._entry.get("SeismicIntensity")
        return self._INTENSITY_MAP.get(intensity_label)

    @classmethod
    def parse(cls, data: dict[str, any]) -> Station:
        """
        Parses the station dictionary and returns an Station object.
        """
        parser = cls(data)
        station = Station(
            id=parser.get_station_id(),
            intensity=parser.get_station_intensity(),
        )
        return station
