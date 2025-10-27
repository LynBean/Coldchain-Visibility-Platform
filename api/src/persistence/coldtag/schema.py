from datetime import datetime

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


class CoreColdtagEventSchema(BaseModel):
    id: int
    core_coldtag_id: int
    event_time: datetime
    time: datetime


class NodeColdtagEventSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


class NodeColdtagEventAlertLiquidSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


class NodeColdtagEventAlertImpactSchema(BaseModel):
    id: int
    node_coldtag_id: int
    core_coldtag_id: int
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime
