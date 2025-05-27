from include.core.equake import Earthquake
from include.core.zone import Zone
from include.core.severity import Severity


class Event:
    def __init__(
        self,
        earthquake_id: int,
        zone_id: int,
        intensity: float,
        severity: str | Severity,
        id: int | None = None,
    ):
        self.id = id
        self.earthquake_id = int(earthquake_id)
        self.zone_id = int(zone_id)
        self.intensity = float(intensity)
        self.severity = Severity(severity)

    @classmethod
    def from_raw(cls, earthquake: Earthquake, zone: Zone) -> "Event":
        station = next((s for s in earthquake.stations if s.id == zone.regions), None)
        intensity = station.intensity if station else 0.0
        severity = cls.determine_severity(earthquake.magnitude, intensity)
        return cls(
            earthquake_id=earthquake.id,
            zone_id=zone.id,
            intensity=intensity,
            severity=severity,
        )

    @classmethod
    def from_dict(cls, data: dict) -> "Event":
        return cls(
            id=data.get("id"),
            earthquake_id=data.get("earthquake_id"),
            zone_id=data.get("zone_id"),
            intensity=data.get("intensity"),
            severity=data.get("severity"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "earthquake_id": self.earthquake_id,
            "zone_id": self.zone_id,
            "intensity": self.intensity,
            "severity": str(self.severity),
        }

    @staticmethod
    def deserialize(data: dict, _) -> "Event":
        return Event.from_dict(data)

    def serialize(self) -> dict:
        return self.to_dict()

    @staticmethod
    def determine_severity(magnitude: float, intensity: float) -> Severity:
        if magnitude >= 5.0 or intensity >= 3.0:
            return Severity.L2
        elif intensity >= 1.0:
            return Severity.L1
        else:
            return Severity.NA

    def __repr__(self):
        return (
            f"Event(id={self.id}, earthquake_id={self.earthquake_id}, "
            f"zone_id={self.zone_id}, intensity={self.intensity}, "
            f"severity={self.severity})"
        )
