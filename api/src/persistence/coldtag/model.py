from collections.abc import Callable, Coroutine
from datetime import datetime
from typing import TYPE_CHECKING, Any

from pydantic import BaseModel, ConfigDict

from .schema import (
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
    core_coldtag: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: CoreColdtagEventSchema, /
    ) -> "PersistedCoreColdtagEvent":
        async def retrieve_core_coldtag() -> PersistedCoreColdtag:
            persisted_core_coldtag = await coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedCoreColdtagEvent(
            id=str(data.id),
            core_coldtag=retrieve_core_coldtag,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEvent(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    core_coldtag: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventSchema, /
    ) -> "PersistedNodeColdtagEvent":
        async def retrieve_node_coldtag() -> PersistedNodeColdtag:
            persisted_node_coldtag = await coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def retrieve_core_coldtag() -> PersistedCoreColdtag:
            persisted_core_coldtag = await coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEvent(
            id=str(data.id),
            node_coldtag=retrieve_node_coldtag,
            core_coldtag=retrieve_core_coldtag,
            temperature=data.temperature,
            humidity=data.humidity,
            latitude=data.latitude,
            longitude=data.longitude,
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertLiquid(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    core_coldtag: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventAlertLiquidSchema, /
    ) -> "PersistedNodeColdtagEventAlertLiquid":
        async def retrieve_node_coldtag() -> PersistedNodeColdtag:
            persisted_node_coldtag = await coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def retrieve_core_coldtag() -> PersistedCoreColdtag:
            persisted_core_coldtag = await coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEventAlertLiquid(
            id=str(data.id),
            node_coldtag=retrieve_node_coldtag,
            core_coldtag=retrieve_core_coldtag,
            latitude=data.latitude,
            longitude=data.longitude,
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtagEventAlertImpact(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    node_coldtag: Callable[..., Coroutine[Any, Any, "PersistedNodeColdtag"]]
    core_coldtag: Callable[..., Coroutine[Any, Any, "PersistedCoreColdtag"]]
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: NodeColdtagEventAlertImpactSchema, /
    ) -> "PersistedNodeColdtagEventAlertImpact":
        async def retrieve_node_coldtag() -> PersistedNodeColdtag:
            persisted_node_coldtag = await coldtag_persistence.find_node_by_id(str(data.node_coldtag_id))
            assert persisted_node_coldtag is not None
            return persisted_node_coldtag

        async def retrieve_core_coldtag() -> PersistedCoreColdtag:
            persisted_core_coldtag = await coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedNodeColdtagEventAlertImpact(
            id=str(data.id),
            node_coldtag=retrieve_node_coldtag,
            core_coldtag=retrieve_core_coldtag,
            latitude=data.latitude,
            longitude=data.longitude,
            core_coldtag_received_time=data.core_coldtag_received_time,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedNodeColdtag(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    mac_address: str
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
    events: Callable[..., Coroutine[Any, Any, list[PersistedCoreColdtagEvent]]]
    deleted: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(
        coldtag_persistence: "ColdtagPersistence", data: CoreColdtagSchema, /
    ) -> "PersistedCoreColdtag":
        async def retrieve_events() -> list[PersistedCoreColdtagEvent]:
            events = await coldtag_persistence.find_core_events_by_core_id(str(data.id))
            return sorted(events, key=lambda x: x.event_time, reverse=True)

        return PersistedCoreColdtag(
            id=str(data.id),
            mac_address=data.mac_address,
            identifier=data.identifier,
            events=retrieve_events,
            deleted=bool(data.deleted),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
