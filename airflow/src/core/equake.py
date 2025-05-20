class Station:
    def __init__(self, id: str, intensity: float):
        self.id = id
        self.intensity = float(intensity)

    @classmethod
    def from_dict(cls, data: dict) -> "Station":
        return cls(
            id=data.get("id"),
            intensity=data.get("intensity"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "intensity": self.intensity,
        }

    @staticmethod
    def deserialize(data: dict, _) -> "Station":
        return Station.from_dict(data)

    def serialize(self) -> dict:
        return self.to_dict()

    def __repr__(self):
        return f"Station(id={self.id}, intensity={self.intensity})"


class Earthquake:
    def __init__(
        self,
        id: int,
        timestamp: int,
        magnitude: float,
        stations: list[Station],
    ):
        self.id = int(id)
        self.timestamp = int(timestamp)
        self.magnitude = float(magnitude)
        self.stations = stations

    @classmethod
    def from_dict(cls, data: dict) -> "Earthquake":
        return cls(
            id=data.get("id"),
            timestamp=data.get("timestamp"),
            magnitude=data.get("magnitude"),
            stations=data.get("stations", []),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "magnitude": self.magnitude,
            "stations": self.stations,
        }

    @staticmethod
    def deserialize(data: dict, _) -> "Earthquake":
        return Earthquake.from_dict(data)

    def serialize(self) -> dict:
        return self.to_dict()

    def __repr__(self):
        return (
            f"Earthquake(id={self.id}, timestamp={self.timestamp}, "
            f"magnitude={self.magnitude}, stations={self.stations})"
        )
