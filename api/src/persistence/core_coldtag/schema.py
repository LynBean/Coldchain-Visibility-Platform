from datetime import datetime

from pydantic import BaseModel


class CoreColdtagEventSchema(BaseModel):
    id: int
    core_coldtag_id: int
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


class CoreColdtagSchema(BaseModel):
    id: int
    mac_address: str
    identifier: str | None
    deleted: bool | None
    created_time: datetime
    updated_time: datetime
