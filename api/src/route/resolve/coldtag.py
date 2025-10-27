import asyncio
from collections.abc import Callable, Coroutine
from datetime import datetime
from typing import TYPE_CHECKING, Any, cast

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


@strawberry.type
class CoreColdtagEvent:
    id: strawberry.scalars.ID

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEvent:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def node_coldtag(self) -> "NodeColdtag":
        return await self._node_coldtag()

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    temperature: float | None
    humidity: float | None
    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEventAlertLiquid:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def node_coldtag(self) -> "NodeColdtag":
        return await self._node_coldtag()

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtagEventAlertImpact:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "NodeColdtag"]]]

    @strawberry.field
    async def node_coldtag(self) -> "NodeColdtag":
        return await self._node_coldtag()

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    latitude: float | None
    longitude: float | None
    core_coldtag_received_time: datetime
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
    async def _resolve_core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    return CoreColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _core_coldtag=_resolve_core_coldtag,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event(
    coldtag_event: PersistedNodeColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEvent:
    async def _resolve_node_coldtag() -> NodeColdtag:
        coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(coldtag, info=info)

    async def _resolve_core_coldtag() -> CoreColdtag:
        coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(coldtag, info=info)

    return NodeColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=_resolve_node_coldtag,
        _core_coldtag=_resolve_core_coldtag,
        temperature=coldtag_event.temperature,
        humidity=coldtag_event.humidity,
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_liquid(
    coldtag_event: PersistedNodeColdtagEventAlertLiquid, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertLiquid:
    async def _resolve_node_coldtag() -> NodeColdtag:
        node_coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(node_coldtag, info=info)

    async def _resolve_core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    return NodeColdtagEventAlertLiquid(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=_resolve_node_coldtag,
        _core_coldtag=_resolve_core_coldtag,
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_impact(
    coldtag_event: PersistedNodeColdtagEventAlertImpact, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertImpact:
    async def _resolve_node_coldtag() -> NodeColdtag:
        node_coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(node_coldtag, info=info)

    async def _resolve_core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    return NodeColdtagEventAlertImpact(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=_resolve_node_coldtag,
        _core_coldtag=_resolve_core_coldtag,
        latitude=coldtag_event.latitude,
        longitude=coldtag_event.longitude,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag(
    node_coldtag: PersistedNodeColdtag, /, info: strawberry.Info["AppContext"]
) -> NodeColdtag:
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
        identifier=node_coldtag.identifier,
        _events=resolve_events,
        deleted=node_coldtag.deleted,
        created_time=node_coldtag.created_time,
        updated_time=node_coldtag.updated_time,
    )


async def resolve_core_coldtag(
    core_coldtag: PersistedCoreColdtag, /, info: strawberry.Info["AppContext"]
) -> CoreColdtag:
    async def resolve_events() -> CoreColdtag.CoreColdtagEvents:
        persisted_events = await core_coldtag.events()
        basic = cast(
            "list[CoreColdtagEvent]",
            await asyncio.gather(*[resolve_core_coldtag_event(event, info=info) for event in persisted_events]),
        )

        return CoreColdtag.CoreColdtagEvents(
            basic=basic,
        )

    return CoreColdtag(
        id=strawberry.scalars.ID(core_coldtag.id),
        mac_address=core_coldtag.mac_address,
        identifier=core_coldtag.identifier,
        _events=resolve_events,
        deleted=core_coldtag.deleted,
        created_time=core_coldtag.created_time,
        updated_time=core_coldtag.updated_time,
    )
