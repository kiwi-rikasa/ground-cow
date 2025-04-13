from enum import Enum


class AlertState(str, Enum):
    active = "active"
    resolved = "resolved"
    closed = "closed"


class UserRole(str, Enum):
    admin = "admin"
    control = "control"
    operator = "operator"


class EventSeverity(str, Enum):
    NA = "NA"
    L1 = "L1"
    L2 = "L2"
