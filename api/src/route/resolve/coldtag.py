import asyncio
from collections.abc import Callable, Coroutine
from datetime import datetime
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


@strawberry.type
class EventCoordinate:
    latitude: float
    longitude: float


@strawberry.type
class CoreColdtagEvent:
    id: strawberry.scalars.ID

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    coordinate: EventCoordinate | None
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

    _coordinate: strawberry.Private[Callable[..., Coroutine[Any, Any, EventCoordinate | None]]]

    @strawberry.field
    async def coordinate(self) -> EventCoordinate | None:
        return await self._coordinate()

    temperature: float | None
    humidity: float | None
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

    _coordinate: strawberry.Private[Callable[..., Coroutine[Any, Any, EventCoordinate | None]]]

    @strawberry.field
    async def coordinate(self) -> EventCoordinate | None:
        return await self._coordinate()

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

    _coordinate: strawberry.Private[Callable[..., Coroutine[Any, Any, EventCoordinate | None]]]

    @strawberry.field
    async def coordinate(self) -> EventCoordinate | None:
        return await self._coordinate()

    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


@strawberry.type
class NodeColdtag:
    id: strawberry.scalars.ID
    mac_address: str
    identifier: str | None

    _telemetry_events: strawberry.Private[Callable[..., Coroutine[Any, Any, list[NodeColdtagEvent]]]]

    @strawberry.field
    async def telemetry_events(self) -> list[NodeColdtagEvent]:
        return await self._telemetry_events()

    _alert_liquid_events: strawberry.Private[Callable[..., Coroutine[Any, Any, list[NodeColdtagEventAlertLiquid]]]]

    @strawberry.field
    async def alert_liquid_events(self) -> list[NodeColdtagEventAlertLiquid]:
        return await self._alert_liquid_events()

    _alert_impact_events: strawberry.Private[Callable[..., Coroutine[Any, Any, list[NodeColdtagEventAlertImpact]]]]

    @strawberry.field
    async def alert_impact_events(self) -> list[NodeColdtagEventAlertImpact]:
        return await self._alert_impact_events()

    deleted: bool
    created_time: datetime
    updated_time: datetime


@strawberry.type
class CoreColdtag:
    id: strawberry.scalars.ID
    mac_address: str
    identifier: str | None

    _telemetry_events: strawberry.Private[Callable[..., Coroutine[Any, Any, list[CoreColdtagEvent]]]]

    @strawberry.field
    async def telemetry_events(self) -> list[CoreColdtagEvent]:
        return await self._telemetry_events()

    deleted: bool
    created_time: datetime
    updated_time: datetime


async def resolve_core_coldtag_event(
    coldtag_event: PersistedCoreColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> CoreColdtagEvent:
    async def __core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    coordinate = (
        EventCoordinate(latitude=coldtag_event.latitude, longitude=coldtag_event.longitude)
        if isinstance(coldtag_event.latitude, float) and isinstance(coldtag_event.longitude, float)
        else None
    )

    return CoreColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _core_coldtag=__core_coldtag,
        coordinate=coordinate,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event(
    coldtag_event: PersistedNodeColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEvent:
    async def __node_coldtag() -> NodeColdtag:
        coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(coldtag, info=info)

    async def __core_coldtag() -> CoreColdtag:
        coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(coldtag, info=info)

    async def __coordinate() -> EventCoordinate | None:
        coldtag_persistence = info.context.coldtag_persistence
        core_coldtag = await coldtag_event.core_coldtag()
        closest_event = await coldtag_persistence.find_core_event_by_closest_time(
            core_coldtag.id, time=coldtag_event.event_time
        )
        if closest_event is None:
            return None

        if not (isinstance(closest_event.latitude, float) and isinstance(closest_event.longitude, float)):
            return None

        return EventCoordinate(latitude=closest_event.latitude, longitude=closest_event.longitude)

    return NodeColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=__node_coldtag,
        _core_coldtag=__core_coldtag,
        _coordinate=__coordinate,
        temperature=coldtag_event.temperature,
        humidity=coldtag_event.humidity,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_liquid(
    coldtag_event: PersistedNodeColdtagEventAlertLiquid, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertLiquid:
    async def __node_coldtag() -> NodeColdtag:
        node_coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(node_coldtag, info=info)

    async def __core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    async def __coordinate() -> EventCoordinate | None:
        coldtag_persistence = info.context.coldtag_persistence
        core_coldtag = await coldtag_event.core_coldtag()
        closest_event = await coldtag_persistence.find_core_event_by_closest_time(
            core_coldtag.id, time=coldtag_event.event_time
        )
        if closest_event is None:
            return None

        if not (isinstance(closest_event.latitude, float) and isinstance(closest_event.longitude, float)):
            return None

        return EventCoordinate(latitude=closest_event.latitude, longitude=closest_event.longitude)

    return NodeColdtagEventAlertLiquid(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=__node_coldtag,
        _core_coldtag=__core_coldtag,
        _coordinate=__coordinate,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag_event_alert_impact(
    coldtag_event: PersistedNodeColdtagEventAlertImpact, /, info: strawberry.Info["AppContext"]
) -> NodeColdtagEventAlertImpact:
    async def __node_coldtag() -> NodeColdtag:
        node_coldtag = await coldtag_event.node_coldtag()
        return await resolve_node_coldtag(node_coldtag, info=info)

    async def __core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    async def __coordinate() -> EventCoordinate | None:
        coldtag_persistence = info.context.coldtag_persistence
        core_coldtag = await coldtag_event.core_coldtag()
        closest_event = await coldtag_persistence.find_core_event_by_closest_time(
            core_coldtag.id, time=coldtag_event.event_time
        )
        if closest_event is None:
            return None

        if not (isinstance(closest_event.latitude, float) and isinstance(closest_event.longitude, float)):
            return None

        return EventCoordinate(latitude=closest_event.latitude, longitude=closest_event.longitude)

    return NodeColdtagEventAlertImpact(
        id=strawberry.scalars.ID(coldtag_event.id),
        _node_coldtag=__node_coldtag,
        _core_coldtag=__core_coldtag,
        _coordinate=__coordinate,
        core_coldtag_received_time=coldtag_event.core_coldtag_received_time,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


async def resolve_node_coldtag(
    node_coldtag: PersistedNodeColdtag, /, info: strawberry.Info["AppContext"]
) -> NodeColdtag:
    async def __telemetry_events() -> list[NodeColdtagEvent]:
        persisted_events = await node_coldtag.telemetry_events()
        return await asyncio.gather(*[resolve_node_coldtag_event(event, info=info) for event in persisted_events])

    async def __alert_liquid_events() -> list[NodeColdtagEventAlertLiquid]:
        persisted_events = await node_coldtag.alert_liquid_events()
        return await asyncio.gather(
            *[resolve_node_coldtag_event_alert_liquid(event, info=info) for event in persisted_events]
        )

    async def __alert_impact_events() -> list[NodeColdtagEventAlertImpact]:
        persisted_events = await node_coldtag.alert_impact_events()
        return await asyncio.gather(
            *[resolve_node_coldtag_event_alert_impact(event, info=info) for event in persisted_events]
        )

    return NodeColdtag(
        id=strawberry.scalars.ID(node_coldtag.id),
        mac_address=node_coldtag.mac_address,
        identifier=node_coldtag.identifier,
        _telemetry_events=__telemetry_events,
        _alert_liquid_events=__alert_liquid_events,
        _alert_impact_events=__alert_impact_events,
        deleted=node_coldtag.deleted,
        created_time=node_coldtag.created_time,
        updated_time=node_coldtag.updated_time,
    )


async def resolve_core_coldtag(
    core_coldtag: PersistedCoreColdtag, /, info: strawberry.Info["AppContext"]
) -> CoreColdtag:
    async def __telemetry_events() -> list[CoreColdtagEvent]:
        persisted_events = await core_coldtag.telemetry_events()
        return await asyncio.gather(*[resolve_core_coldtag_event(event, info=info) for event in persisted_events])

    return CoreColdtag(
        id=strawberry.scalars.ID(core_coldtag.id),
        mac_address=core_coldtag.mac_address,
        identifier=core_coldtag.identifier,
        _telemetry_events=__telemetry_events,
        deleted=core_coldtag.deleted,
        created_time=core_coldtag.created_time,
        updated_time=core_coldtag.updated_time,
    )
