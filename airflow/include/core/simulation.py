from datetime import datetime
from typing import TypedDict

from include.core.equake import Earthquake
from include.core.equake_parser import EarthquakeParser


class SimulationEntry(TypedDict):
    delta: int
    earthquake: dict[str, any]


class SimulationData:
    def __init__(
        self,
        base_time: int = int(datetime.now().timestamp()),
        earthquakes: list[Earthquake] = [],
    ):
        self.base_time = base_time
        self.earthquakes = earthquakes

    @staticmethod
    def _apply_json_template(earthquake: dict[str, any]) -> dict[str, any]:
        return {"records": {"Earthquake": [earthquake]}}

    @staticmethod
    def _reparse_id(earthquake: Earthquake) -> int:
        dt = datetime.fromtimestamp(earthquake.timestamp)
        id_time = dt.strftime("%Y%m%d%H%M%S")
        id_magnitude = f"{earthquake.magnitude:.1f}".replace(".", "")
        id_serial = 999
        return int(f"{id_time}")

    @classmethod
    def from_raw(cls, entries: list[SimulationEntry] = []) -> "SimulationData":
        base_time = int(datetime.now().timestamp())
        earthquakes: list[Earthquake] = []

        for re in entries:
            # Apply the CWA JSON template to the earthquake data
            earthquake_json = cls._apply_json_template(re["earthquake"])
            # Parse the earthquake data
            earthquake = EarthquakeParser.parse(earthquake_json)
            # Set the new id, timestamp and source
            earthquake.timestamp = base_time + re["delta"]
            earthquake.id = cls._reparse_id(earthquake)
            earthquake.source = "Simulation"
            # Add the earthquake to the list
            earthquakes.append(earthquake)

        return cls(base_time=base_time, earthquakes=earthquakes)

    def __len__(self):
        return len(self.earthquakes)

    def __getitem__(self, idx):
        return self.earthquakes[idx]
