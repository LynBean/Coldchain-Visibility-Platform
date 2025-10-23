from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class CoreColdtagSchema(BaseModel):
    id: int
    mac_address: str
    identifier: str | None
    deleted: bool | None
    created_time: datetime
    updated_time: datetime


class NodeColdtagSchema(BaseModel):
    id: int
    mac_address: str
    identifier: str | None
    deleted: bool | None
    created_time: datetime
    updated_time: datetime


class ColdtagConnectionStatusEnum(str, Enum):
    connected = "connected"
    disconnected = "disconnected"


class CoreColdtagEventSchema(BaseModel):
    id: int
    core_coldtag_id: int
    connection_status: ColdtagConnectionStatusEnum
    event_time: datetime
    time: datetime


class NodeColdtagEventSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    connection_status: ColdtagConnectionStatusEnum
    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


class NodeColdtagEventAlertLiquidSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    connection_status: ColdtagConnectionStatusEnum
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


class NodeColdtagEventAlertImpactSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    connection_status: ColdtagConnectionStatusEnum
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime
