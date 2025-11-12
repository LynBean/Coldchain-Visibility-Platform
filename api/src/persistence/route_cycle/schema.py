from datetime import datetime

from pydantic import BaseModel


class RouteCycleSchema(BaseModel):
    id: int
    node_coldtag_id: int
    identifier: str | None
    description: str | None
    owner_name: str | None
    placed_at: str | None
    departure_latitude: float | None
    departure_longitude: float | None
    destination_latitude: float | None
    destination_longitude: float | None
    temperature_alert_threshold: float | None
    humidity_alert_threshold: float | None
    started: bool | None
    completed: bool | None
    canceled: bool | None
    dispatch_time: datetime | None
    completion_time: datetime | None
    created_time: datetime
    updated_time: datetime
