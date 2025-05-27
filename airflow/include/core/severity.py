from enum import Enum

_ORDER = {"NA": 0, "L1": 1, "L2": 2}


class Severity(Enum):
    NA = "NA"
    L1 = "L1"
    L2 = "L2"

    def __new__(cls, value):
        # Accepts case-insensitive input and stringified input
        value_str = str(value).upper()
        if value_str not in _ORDER:
            raise ValueError(f"Invalid Severity: {value}")
        obj = object.__new__(cls)
        obj._value_ = value_str
        return obj

    @staticmethod
    def deserialize(data: str, _=None) -> "Severity":
        return Severity(data)

    def serialize(self) -> str:
        return str(self)

    def _compare(self, other: "Severity", method):
        if not isinstance(other, Severity):
            other = Severity(other)
        return method(_ORDER[self.value], _ORDER[other.value])

    def __lt__(self, other):
        return self._compare(other, int.__lt__)

    def __le__(self, other):
        return self._compare(other, int.__le__)

    def __gt__(self, other):
        return self._compare(other, int.__gt__)

    def __ge__(self, other):
        return self._compare(other, int.__ge__)

    def __str__(self):
        return self.value
