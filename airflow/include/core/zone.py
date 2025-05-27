class Zone:
    def __init__(self, id: int, regions: str):
        self.id = int(id)
        self.regions = regions

    @classmethod
    def from_dict(cls, data: dict) -> "Zone":
        return cls(
            id=data.get("id"),
            regions=data.get("regions"),
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "regions": self.regions,
        }

    @staticmethod
    def deserialize(data: dict, _) -> "Zone":
        return Zone.from_dict(data)

    def serialize(self) -> dict:
        return self.to_dict()

    def __repr__(self):
        return f"Zone(id={self.id}, regions={self.regions})"
