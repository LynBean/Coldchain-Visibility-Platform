from collections.abc import Awaitable
from datetime import datetime

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict

from src.persistence.node_coldtag import (
    NodeColdtagPersistence,
    PersistedNodeColdtag,
    PersistedNodeColdtagEvent,
    PersistedNodeColdtagEventAlertImpact,
    PersistedNodeColdtagEventAlertLiquid,
)

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
    started: bool
    completed: bool
    canceled: bool
    dispatch_time: datetime | None
    completion_time: datetime | None
    telemetry_events: Awaitable[list[PersistedNodeColdtagEvent]]
    alert_liquid_events: Awaitable[list[PersistedNodeColdtagEventAlertLiquid]]
    alert_impact_events: Awaitable[list[PersistedNodeColdtagEventAlertImpact]]
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

        async def __telemetry_events() -> list[PersistedNodeColdtagEvent]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            if data.dispatch_time is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await node_coldtag_persistence.find_node_events_by_time_range(
                str(data.node_coldtag_id), dispatch_time=data.dispatch_time, completion_time=data.completion_time
            )

        async def __alert_liquid_events() -> list[PersistedNodeColdtagEventAlertLiquid]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            if data.dispatch_time is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await node_coldtag_persistence.find_node_event_alert_liquids_by_time_range(
                str(data.node_coldtag_id), dispatch_time=data.dispatch_time, completion_time=data.completion_time
            )

        async def __alert_impact_events() -> list[PersistedNodeColdtagEventAlertImpact]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            if data.dispatch_time is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await node_coldtag_persistence.find_node_event_alert_impacts_by_time_range(
                str(data.node_coldtag_id), dispatch_time=data.dispatch_time, completion_time=data.completion_time
            )

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
            started=bool(data.started),
            completed=bool(data.completed),
            canceled=bool(data.canceled),
            dispatch_time=data.dispatch_time,
            completion_time=data.completion_time,
            telemetry_events=__telemetry_events(),
            alert_liquid_events=__alert_liquid_events(),
            alert_impact_events=__alert_impact_events(),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
