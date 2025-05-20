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
