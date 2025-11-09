from collections.abc import Awaitable
from datetime import datetime

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict

from src.persistence.node_coldtag import NodeColdtagPersistence, PersistedNodeColdtag

from .schema import (
    RouteCycleSchema,
)


class PersistedRouteCycle(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Awaitable[PersistedNodeColdtag]
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
    completed: bool
    canceled: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(app: FastAPI, data: RouteCycleSchema, /) -> "PersistedRouteCycle":
        async def __node_coldtag() -> PersistedNodeColdtag:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            persisted_node = await node_coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            if not persisted_node:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

            return persisted_node

        return PersistedRouteCycle(
            id=str(data.id),
            node_coldtag=__node_coldtag(),
            identifier=data.identifier,
            description=data.description,
            owner_name=data.owner_name,
            placed_at=data.placed_at,
            departure_latitude=data.departure_latitude,
            departure_longitude=data.departure_longitude,
            destination_latitude=data.destination_latitude,
            destination_longitude=data.destination_longitude,
            temperature_alert_threshold=data.temperature_alert_threshold,
            humidity_alert_threshold=data.humidity_alert_threshold,
            completed=bool(data.completed),
            canceled=bool(data.canceled),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
