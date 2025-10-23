import asyncio
from collections.abc import Callable, Coroutine
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

import strawberry

from src.persistence.coldtag import (
    PersistedCoreColdtag,
    PersistedCoreColdtagEvent,
    PersistedNodeColdtag,
    PersistedNodeColdtagEvent,
    PersistedNodeColdtagEventAlertImpact,
    PersistedNodeColdtagEventAlertLiquid,
)

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.enum
class ColdtagEventConnectionStatus(Enum):
    connected = "connected"
    disconnected = "disconnected"


@strawberry.type
class CoreColdtagEvent:
    id: strawberry.scalars.ID

    _coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def coldtag(self) -> "CoreColdtag":
        return await self._coldtag()

    connection_status: ColdtagEventConnectionStatus
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEvent:
    id: strawberry.scalars.ID

    _coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def coldtag(self) -> "NodeColdtag":
        return await self._coldtag()

    connection_status: ColdtagEventConnectionStatus
    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEventAlertLiquid:
    id: strawberry.scalars.ID

    _coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def coldtag(self) -> "NodeColdtag":
        return await self._coldtag()

    connection_status: ColdtagEventConnectionStatus
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEventAlertImpact:
    id: strawberry.scalars.ID

    _coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def coldtag(self) -> "NodeColdtag":
        return await self._coldtag()

    connection_status: ColdtagEventConnectionStatus
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtag:
    @strawberry.type
    class NodeColdtagEvents:
        basic: list[NodeColdtagEvent]
        alert_liquid: list[NodeColdtagEventAlertLiquid]
        alert_impact: list[NodeColdtagEventAlertImpact]

    id: strawberry.scalars.ID
    mac_address: str

    _core: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core(self) -> "CoreColdtag":
        return await self._core()

    identifier: str | None

    _events: strawberry.Private[Callable[..., Coroutine[Any, Any, NodeColdtagEvents]]]

    @strawberry.field
    async def events(self) -> NodeColdtagEvents:
        return await self._events()

    deleted: bool
    created_time: datetime
    updated_time: datetime


@strawberry.type
class CoreColdtag:
    @strawberry.type
    class CoreColdtagEvents:
        basic: list[CoreColdtagEvent]

    id: strawberry.scalars.ID
    mac_address: str
    identifier: str | None

    _nodes: strawberry.Private[Callable[..., Coroutine[Any, Any, list[NodeColdtag]]]]

    @strawberry.field
    async def nodes(self) -> list[NodeColdtag]:
        return await self._nodes()

    _events: strawberry.Private[Callable[..., Coroutine[Any, Any, CoreColdtagEvents]]]

    @strawberry.field
    async def events(self) -> CoreColdtagEvents:
        return await self._events()

    deleted: bool
    created_time: datetime
    updated_time: datetime


async def resolve_core_coldtag_event(
    coldtag_event: PersistedCoreColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> CoreColdtagEvent:
    async def resolve_coldtag() -> CoreColdtag:
        coldtag = await coldtag_event.coldtag()
        return await resolve_core_coldtag(coldtag, info=info)

    return CoreColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _coldtag=resolve_coldtag,
        connection_status=ColdtagEventConnectionStatus(coldtag_event.connection_status),
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event(
    coldtag_event: PersistedNodeColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEvent:
    async def resolve_coldtag() -> NodeColdtag:
        coldtag = await coldtag_event.coldtag()
        return await resolve_node_coldtag(coldtag, info=info)

    return NodeColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _coldtag=resolve_coldtag,
        connection_status=ColdtagEventConnectionStatus(coldtag_event.connection_status),
        temperature=coldtag_event.temperature,
        humidity=coldtag_event.humidity,
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_liquid(
    coldtag_event: PersistedNodeColdtagEventAlertLiquid, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertLiquid:
    async def resolve_coldtag() -> NodeColdtag:
        coldtag = await coldtag_event.coldtag()
        return await resolve_node_coldtag(coldtag, info=info)

    return NodeColdtagEventAlertLiquid(
        id=strawberry.scalars.ID(coldtag_event.id),
        _coldtag=resolve_coldtag,
        connection_status=ColdtagEventConnectionStatus(coldtag_event.connection_status),
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_impact(
    coldtag_event: PersistedNodeColdtagEventAlertImpact, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertImpact:
    async def resolve_coldtag() -> NodeColdtag:
        coldtag = await coldtag_event.coldtag()
        return await resolve_node_coldtag(coldtag, info=info)

    return NodeColdtagEventAlertImpact(
        id=strawberry.scalars.ID(coldtag_event.id),
        _coldtag=resolve_coldtag,
        connection_status=ColdtagEventConnectionStatus(coldtag_event.connection_status),
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag(
    node_coldtag: PersistedNodeColdtag, /, info: strawberry.Info["AppContext"]
) -> NodeColdtag:
    async def resolve_core() -> CoreColdtag:
        core = await node_coldtag.core()
        return await resolve_core_coldtag(core, info=info)

    async def resolve_events() -> NodeColdtag.NodeColdtagEvents:
        persisted_events = await node_coldtag.events()
        basic, alert_liquid, alert_impact = await asyncio.gather(
            asyncio.gather(
                *[
                    resolve_node_coldtag_event(event, info=info)
                    for event in persisted_events
                    if isinstance(event, PersistedNodeColdtagEvent)
                ]
            ),
            asyncio.gather(
                *[
                    resolve_node_coldtag_event_alert_liquid(event, info=info)
                    for event in persisted_events
                    if isinstance(event, PersistedNodeColdtagEventAlertLiquid)
                ]
            ),
            asyncio.gather(
                *[
                    resolve_node_coldtag_event_alert_impact(event, info=info)
                    for event in persisted_events
                    if isinstance(event, PersistedNodeColdtagEventAlertImpact)
                ]
            ),
        )

        return NodeColdtag.NodeColdtagEvents(
            basic=basic,
            alert_liquid=alert_liquid,
            alert_impact=alert_impact,
        )

    return NodeColdtag(
        id=strawberry.scalars.ID(node_coldtag.id),
        mac_address=node_coldtag.mac_address,
        _core=resolve_core,
        identifier=node_coldtag.identifier,
        _events=resolve_events,
        deleted=node_coldtag.deleted,
        created_time=node_coldtag.created_time,
        updated_time=node_coldtag.updated_time,
    )


async def resolve_core_coldtag(
    core_coldtag: PersistedCoreColdtag, /, info: strawberry.Info["AppContext"]
) -> CoreColdtag:
    async def resolve_nodes() -> list[NodeColdtag]:
        nodes = await core_coldtag.nodes()
        return await asyncio.gather(*[resolve_node_coldtag(node, info=info) for node in nodes])

    async def resolve_events() -> CoreColdtag.CoreColdtagEvents:
        persisted_events = await core_coldtag.events()
        basic = await asyncio.gather(*[resolve_core_coldtag_event(event, info=info) for event in persisted_events])

        return CoreColdtag.CoreColdtagEvents(
            basic=basic,
        )

    return CoreColdtag(
        id=strawberry.scalars.ID(core_coldtag.id),
        mac_address=core_coldtag.mac_address,
        identifier=core_coldtag.identifier,
        _nodes=resolve_nodes,
        _events=resolve_events,
        deleted=core_coldtag.deleted,
        created_time=core_coldtag.created_time,
        updated_time=core_coldtag.updated_time,
    )
