from collections.abc import Callable, Coroutine
from datetime import datetime
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel, ConfigDict

from .schema import (
    ColdtagConnectionStatusEnum,
    CoreColdtagEventSchema,
    CoreColdtagSchema,
    NodeColdtagEventAlertImpactSchema,
    NodeColdtagEventAlertLiquidSchema,
    NodeColdtagEventSchema,
    NodeColdtagSchema,
)

if TYPE_CHECKING:
    from . import ColdtagPersistence


class PersistedCoreColdtagEvent(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    coldtag: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    connection_status: ColdtagConnectionStatusEnum
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: CoreColdtagEventSchema, /
    ) -> "PersistedCoreColdtagEvent":
        async def retrieve_coldtag() -> PersistedCoreColdtag:
            persisted_coldtag = await coldtag_persistence.find_core_by_id(str(data.id))
            assert persisted_coldtag is not None
            return persisted_coldtag

        return PersistedCoreColdtagEvent(
            id=str(data.id),
            coldtag=retrieve_coldtag,
            connection_status=data.connection_status,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEvent(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    connection_status: ColdtagConnectionStatusEnum
    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventSchema, /
    ) -> "PersistedNodeColdtagEvent":
        async def retrieve_coldtag() -> PersistedNodeColdtag:
            persisted_coldtag = await coldtag_persistence.find_node_by_id(str(data.id))
            assert persisted_coldtag is not None
            return persisted_coldtag

        return PersistedNodeColdtagEvent(
            id=str(data.id),
            coldtag=retrieve_coldtag,
            connection_status=data.connection_status,
            temperature=data.temperature,
            humidity=data.humidity,
            latitude=data.latitude,
            longitude=data.longitude,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertLiquid(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    connection_status: ColdtagConnectionStatusEnum
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventAlertLiquidSchema, /
    ) -> "PersistedNodeColdtagEventAlertLiquid":
        async def retrieve_coldtag() -> PersistedNodeColdtag:
            persisted_coldtag = await coldtag_persistence.find_node_by_id(str(data.id))
            assert persisted_coldtag is not None
            return persisted_coldtag

        return PersistedNodeColdtagEventAlertLiquid(
            id=str(data.id),
            coldtag=retrieve_coldtag,
            connection_status=data.connection_status,
            latitude=data.latitude,
            longitude=data.longitude,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertImpact(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    connection_status: ColdtagConnectionStatusEnum
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventAlertImpactSchema, /
    ) -> "PersistedNodeColdtagEventAlertImpact":
        async def retrieve_coldtag() -> PersistedNodeColdtag:
            persisted_coldtag = await coldtag_persistence.find_node_by_id(str(data.id))
            assert persisted_coldtag is not None
            return persisted_coldtag

        return PersistedNodeColdtagEventAlertImpact(
            id=str(data.id),
            coldtag=retrieve_coldtag,
            connection_status=data.connection_status,
            latitude=data.latitude,
            longitude=data.longitude,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtag(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    mac_address: str
    core: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    identifier: str | None
    events: Callable[
        ...,
        Coroutine[
            Any,
            Any,
            list[
                PersistedNodeColdtagEvent | PersistedNodeColdtagEventAlertLiquid | PersistedNodeColdtagEventAlertImpact
            ],
        ],
    ]
    deleted: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagSchema, /
    ) -> "PersistedNodeColdtag":
        async def retrieve_core() -> "PersistedCoreColdtag":
            persisted_coldtag = await coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_coldtag is not None
            return persisted_coldtag

        async def retrieve_events() -> list[
            PersistedNodeColdtagEvent | PersistedNodeColdtagEventAlertLiquid | PersistedNodeColdtagEventAlertImpact
        ]:
            events = await coldtag_persistence.find_node_events_by_node_id(str(data.id))
            liquids = await coldtag_persistence.find_node_event_alert_liquids_by_node_id(str(data.id))
            impacts = await coldtag_persistence.find_node_event_alert_impacts_by_node_id(str(data.id))

            return sorted([*events, *liquids, *impacts], key=lambda x: x.event_time, reverse=True)

        return PersistedNodeColdtag(
            id=str(data.id),
            mac_address=data.mac_address,
            core=retrieve_core,
            identifier=data.identifier,
            events=retrieve_events,
            deleted=bool(data.deleted),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )


class PersistedCoreColdtag(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    mac_address: str
    identifier: str | None
    nodes: Callable[..., Coroutine[Any, Any, list[PersistedNodeColdtag]]]
    events: Callable[..., Coroutine[Any, Any, list[PersistedCoreColdtagEvent]]]
    deleted: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: CoreColdtagSchema, /
    ) -> "PersistedCoreColdtag":
        async def retrieve_nodes() -> list[PersistedNodeColdtag]:
            return await coldtag_persistence.find_nodes_by_core_id(str(data.id))

        async def retrieve_events() -> list[PersistedCoreColdtagEvent]:
            events = await coldtag_persistence.find_core_events_by_core_id(str(data.id))
            return sorted(events, key=lambda x: x.event_time, reverse=True)

        return PersistedCoreColdtag(
            id=str(data.id),
            mac_address=data.mac_address,
            identifier=data.identifier,
            nodes=retrieve_nodes,
            events=retrieve_events,
            deleted=bool(data.deleted),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
