from src.core.event import Event
from src.core.severity import Severity


class Alert:
    def __init__(
        self,
        zone_id: int,
        timestamp: int,
        severity: str | Severity,
        id: int | None = None,
        event_id: int | None = None,
        suppressed_by: int | None = None,
    ):
        self.id = id
        self.event_id = event_id
        self.zone_id = int(zone_id)
        self.timestamp = int(timestamp)
        self.severity = Severity(severity)
        self.suppressed_by = suppressed_by

    @classmethod
    def from_event(cls, event: Event, timestamp: int) -> "Alert":
        return cls(
            event_id=event.id,
            zone_id=event.zone_id,
            timestamp=timestamp,
            severity=event.severity,
        )

    @classmethod
    def from_dict(cls, data: dict) -> "Alert":
        return cls(
            id=data.get("id"),
            event_id=data.get("event_id"),
            zone_id=data.get("zone_id"),
            timestamp=data.get("timestamp"),
            severity=data.get("severity"),
            suppressed_by=data.get("suppressed_by"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "event_id": self.event_id,
            "zone_id": self.zone_id,
            "timestamp": self.timestamp,
            "severity": str(self.severity),
            "suppressed_by": self.suppressed_by,
        }

    @staticmethod
    def deserialize(data: dict, _) -> "Alert":
        return Alert.from_dict(data)

    def serialize(self) -> dict:
        return self.to_dict()

    def __repr__(self) -> str:
        return (
            f"Alert(id={self.id}, event_id={self.event_id}, "
            f"zone_id={self.zone_id}, timestamp={self.timestamp}, "
            f"severity={self.severity}, suppressed_by={self.suppressed_by})"
        )

    def should_be_suppressed_by(self, other: "Alert | None", interval: int) -> bool:
        """
        Check if this alert should be suppressed by another alert based on the timestamp and severity.

        :param other: The other alert to compare against.
        :param interval: The suppression interval in seconds.
        :return: True if this alert should be suppressed by the other alert, False otherwise.
        """
        if other is None:
            return False
        within_interval = (self.timestamp - other.timestamp) <= interval
        not_more_severe = self.severity <= other.severity
        return within_interval and not_more_severe
