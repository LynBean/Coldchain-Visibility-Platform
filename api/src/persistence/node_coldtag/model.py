import asyncio
from collections.abc import Awaitable
from datetime import datetime
from typing import TYPE_CHECKING

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

from src.persistence.core_coldtag import CoreColdtagPersistence, PersistedCoreColdtag

from .schema import (
    NodeColdtagEventAlertImpactSchema,
    NodeColdtagEventAlertLiquidSchema,
    NodeColdtagEventSchema,
    NodeColdtagSchema,
)

if TYPE_CHECKING:
    from src.persistence.node_coldtag import NodeColdtagPersistence


class PersistedNodeColdtagEvent(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Awaitable["PersistedNodeColdtag"]
    core_coldtag: Awaitable[PersistedCoreColdtag]
    temperature: float | None
    humidity: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(app: FastAPI, data: NodeColdtagEventSchema, /) -> "PersistedNodeColdtagEvent":
        async def __node_coldtag() -> PersistedNodeColdtag:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            persisted_node_coldtag = await node_coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def __core_coldtag() -> PersistedCoreColdtag:
            core_coldtag_persistence: CoreColdtagPersistence = app.extra["core_coldtag_persistence"]
            persisted_core_coldtag = await core_coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEvent(
            id=str(data.id),
            node_coldtag=__node_coldtag(),
            core_coldtag=asyncio.create_task(__core_coldtag()),
            temperature=data.temperature,
            humidity=data.humidity,
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertLiquid(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Awaitable["PersistedNodeColdtag"]
    core_coldtag: Awaitable[PersistedCoreColdtag]
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        app: FastAPI, data: NodeColdtagEventAlertLiquidSchema, /
    ) -> "PersistedNodeColdtagEventAlertLiquid":
        async def __node_coldtag() -> PersistedNodeColdtag:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            persisted_node_coldtag = await node_coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def __core_coldtag() -> PersistedCoreColdtag:
            core_coldtag_persistence: CoreColdtagPersistence = app.extra["core_coldtag_persistence"]
            persisted_core_coldtag = await core_coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEventAlertLiquid(
            id=str(data.id),
            node_coldtag=__node_coldtag(),
            core_coldtag=asyncio.create_task(__core_coldtag()),
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertImpact(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Awaitable["PersistedNodeColdtag"]
    core_coldtag: Awaitable[PersistedCoreColdtag]
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        app: FastAPI, data: NodeColdtagEventAlertImpactSchema, /
    ) -> "PersistedNodeColdtagEventAlertImpact":
        async def __node_coldtag() -> PersistedNodeColdtag:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            persisted_node_coldtag = await node_coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def __core_coldtag() -> PersistedCoreColdtag:
            core_coldtag_persistence: CoreColdtagPersistence = app.extra["core_coldtag_persistence"]
            persisted_core_coldtag = await core_coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEventAlertImpact(
            id=str(data.id),
            node_coldtag=__node_coldtag(),
            core_coldtag=asyncio.create_task(__core_coldtag()),
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtag(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    mac_address: str
    identifier: str | None
    telemetry_events: Awaitable[list["PersistedNodeColdtagEvent"]]
    alert_liquid_events: Awaitable[list["PersistedNodeColdtagEventAlertLiquid"]]
    alert_impact_events: Awaitable[list["PersistedNodeColdtagEventAlertImpact"]]
    deleted: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(app: FastAPI, data: NodeColdtagSchema, /) -> "PersistedNodeColdtag":
        async def __telemetry_events() -> list["PersistedNodeColdtagEvent"]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            events = await node_coldtag_persistence.find_node_events_by_node_id(str(data.id))
            return sorted(events, key=lambda x: x.event_time, reverse=True)

        async def __alert_liquid_events() -> list["PersistedNodeColdtagEventAlertLiquid"]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            liquids = await node_coldtag_persistence.find_node_event_alert_liquids_by_node_id(str(data.id))
            return sorted(liquids, key=lambda x: x.event_time, reverse=True)

        async def __alert_impact_events() -> list["PersistedNodeColdtagEventAlertImpact"]:
            node_coldtag_persistence: NodeColdtagPersistence = app.extra["node_coldtag_persistence"]
            impacts = await node_coldtag_persistence.find_node_event_alert_impacts_by_node_id(str(data.id))
            return sorted(impacts, key=lambda x: x.event_time, reverse=True)

        return PersistedNodeColdtag(
            id=str(data.id),
            mac_address=data.mac_address,
            identifier=data.identifier,
            telemetry_events=__telemetry_events(),
            alert_liquid_events=__alert_liquid_events(),
            alert_impact_events=__alert_impact_events(),
            deleted=bool(data.deleted),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
