import asyncio
from collections.abc import Awaitable
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry

from src.persistence.route_cycle import PersistedRouteCycle
from src.persistence.route_cycle.model import (
    PersistedRouteCycleAlertHumidityEvent,
    PersistedRouteCycleAlertTemperatureEvent,
)
from src.route.resolve.coordinate import Coordinate
from src.route.resolve.core_coldtag import CoreColdtag, resolve_core_coldtag
from src.route.resolve.node_coldtag import (
    NodeColdtag,
    NodeColdtagEvent,
    NodeColdtagEventAlertImpact,
    NodeColdtagEventAlertLiquid,
    resolve_node_coldtag,
    resolve_node_coldtag_event,
    resolve_node_coldtag_event_alert_impact,
    resolve_node_coldtag_event_alert_liquid,
)

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class RouteCycleAlertTemperatureEvent:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Awaitable["NodeColdtag"]]

    @strawberry.field
    async def node_coldtag(self) -> "NodeColdtag":
        return await self._node_coldtag

    _core_coldtag: strawberry.Private[Awaitable[CoreColdtag]]

    @strawberry.field
    async def core_coldtag(self) -> CoreColdtag:
        return await self._core_coldtag

    _coordinate: strawberry.Private[Awaitable[Coordinate | None]]

    @strawberry.field
    async def coordinate(self) -> Coordinate | None:
        return await self._coordinate

    temperature: float
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


async def resolve_route_cycle_alert_temperature_event(
    alert_temperature_event: PersistedRouteCycleAlertTemperatureEvent, /, info: strawberry.Info["AppContext"]
) -> RouteCycleAlertTemperatureEvent:
    async def __node_coldtag() -> NodeColdtag:
        coldtag = await alert_temperature_event.node_coldtag
        return await resolve_node_coldtag(coldtag, info=info)

    async def __core_coldtag() -> CoreColdtag:
        coldtag = await alert_temperature_event.core_coldtag
        return await resolve_core_coldtag(coldtag, info=info)

    async def __coordinate() -> Coordinate | None:
        core_coldtag_persistence = info.context.core_coldtag_persistence
        core_coldtag = await alert_temperature_event.core_coldtag
        closest_event = await core_coldtag_persistence.find_core_event_by_closest_time(
            core_coldtag.id, time=alert_temperature_event.event_time
        )
        if closest_event is None:
            return None

        if not (isinstance(closest_event.latitude, float) and isinstance(closest_event.longitude, float)):
            return None

        return Coordinate(latitude=closest_event.latitude, longitude=closest_event.longitude)

    return RouteCycleAlertTemperatureEvent(
        id=strawberry.scalars.ID(alert_temperature_event.id),
        _node_coldtag=__node_coldtag(),
        _core_coldtag=__core_coldtag(),
        _coordinate=__coordinate(),
        temperature=alert_temperature_event.temperature,
        core_coldtag_received_time=alert_temperature_event.core_coldtag_received_time,
        event_time=alert_temperature_event.event_time,
        time=alert_temperature_event.time,
    )


@strawberry.type
class RouteCycleAlertHumidityEvent:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Awaitable["NodeColdtag"]]

    @strawberry.field
    async def node_coldtag(self) -> "NodeColdtag":
        return await self._node_coldtag

    _core_coldtag: strawberry.Private[Awaitable[CoreColdtag]]

    @strawberry.field
    async def core_coldtag(self) -> CoreColdtag:
        return await self._core_coldtag

    _coordinate: strawberry.Private[Awaitable[Coordinate | None]]

    @strawberry.field
    async def coordinate(self) -> Coordinate | None:
        return await self._coordinate

    humidity: float
    core_coldtag_received_time: datetime
    event_time: datetime
    time: datetime


async def resolve_route_cycle_alert_humidity_event(
    alert_humidity_event: PersistedRouteCycleAlertHumidityEvent, /, info: strawberry.Info["AppContext"]
) -> RouteCycleAlertHumidityEvent:
    async def __node_coldtag() -> NodeColdtag:
        coldtag = await alert_humidity_event.node_coldtag
        return await resolve_node_coldtag(coldtag, info=info)

    async def __core_coldtag() -> CoreColdtag:
        coldtag = await alert_humidity_event.core_coldtag
        return await resolve_core_coldtag(coldtag, info=info)

    async def __coordinate() -> Coordinate | None:
        core_coldtag_persistence = info.context.core_coldtag_persistence
        core_coldtag = await alert_humidity_event.core_coldtag
        closest_event = await core_coldtag_persistence.find_core_event_by_closest_time(
            core_coldtag.id, time=alert_humidity_event.event_time
        )
        if closest_event is None:
            return None

        if not (isinstance(closest_event.latitude, float) and isinstance(closest_event.longitude, float)):
            return None

        return Coordinate(latitude=closest_event.latitude, longitude=closest_event.longitude)

    return RouteCycleAlertHumidityEvent(
        id=strawberry.scalars.ID(alert_humidity_event.id),
        _node_coldtag=__node_coldtag(),
        _core_coldtag=__core_coldtag(),
        _coordinate=__coordinate(),
        humidity=alert_humidity_event.humidity,
        core_coldtag_received_time=alert_humidity_event.core_coldtag_received_time,
        event_time=alert_humidity_event.event_time,
        time=alert_humidity_event.time,
    )


@strawberry.type
class RouteCycle:
    id: strawberry.scalars.ID

    _node_coldtag: strawberry.Private[Awaitable[NodeColdtag]]

    @strawberry.field
    async def node_coldtag(self) -> NodeColdtag:
        return await self._node_coldtag

    identifier: str | None
    description: str | None
    owner_name: str | None
    placed_at: str | None
    departure_coordinate: Coordinate | None
    destination_coordinate: Coordinate | None
    temperature_alert_threshold: float | None
    humidity_alert_threshold: float | None
    started: bool
    completed: bool
    canceled: bool
    dispatch_time: datetime | None
    completion_time: datetime | None

    _telemetry_events: strawberry.Private[Awaitable[list[NodeColdtagEvent]]]

    @strawberry.field
    async def telemetry_events(self) -> list[NodeColdtagEvent]:
        return await self._telemetry_events

    _alert_liquid_events: strawberry.Private[Awaitable[list[NodeColdtagEventAlertLiquid]]]

    @strawberry.field
    async def alert_liquid_events(self) -> list[NodeColdtagEventAlertLiquid]:
        return await self._alert_liquid_events

    _alert_impact_events: strawberry.Private[Awaitable[list[NodeColdtagEventAlertImpact]]]

    @strawberry.field
    async def alert_impact_events(self) -> list[NodeColdtagEventAlertImpact]:
        return await self._alert_impact_events

    _alert_temperature_events: strawberry.Private[Awaitable[list[RouteCycleAlertTemperatureEvent]]]

    @strawberry.field
    async def alert_temperature_events(self) -> list[RouteCycleAlertTemperatureEvent]:
        return await self._alert_temperature_events

    _alert_humidity_events: strawberry.Private[Awaitable[list[RouteCycleAlertHumidityEvent]]]

    @strawberry.field
    async def alert_humidity_events(self) -> list[RouteCycleAlertHumidityEvent]:
        return await self._alert_humidity_events

    created_time: datetime
    updated_time: datetime


async def resolve_route_cycle(route_cycle: PersistedRouteCycle, /, info: strawberry.Info["AppContext"]) -> RouteCycle:
    async def __node_coldtag() -> NodeColdtag:
        node_coldtag = await route_cycle.node_coldtag
        return await resolve_node_coldtag(node_coldtag, info=info)

    async def __telemetry_events() -> list[NodeColdtagEvent]:
        persisted_events = await route_cycle.telemetry_events
        return await asyncio.gather(*[resolve_node_coldtag_event(event, info=info) for event in persisted_events])

    async def __alert_liquid_events() -> list[NodeColdtagEventAlertLiquid]:
        persisted_events = await route_cycle.alert_liquid_events
        return await asyncio.gather(
            *[resolve_node_coldtag_event_alert_liquid(event, info=info) for event in persisted_events]
        )

    async def __alert_impact_events() -> list[NodeColdtagEventAlertImpact]:
        persisted_events = await route_cycle.alert_impact_events
        return await asyncio.gather(
            *[resolve_node_coldtag_event_alert_impact(event, info=info) for event in persisted_events]
        )

    async def __alert_temperature_events() -> list[RouteCycleAlertTemperatureEvent]:
        persisted_events = await route_cycle.alert_temperature_events
        return await asyncio.gather(
            *[resolve_route_cycle_alert_temperature_event(event, info=info) for event in persisted_events]
        )

    async def __alert_humidity_events() -> list[RouteCycleAlertHumidityEvent]:
        persisted_events = await route_cycle.alert_humidity_events
        return await asyncio.gather(
            *[resolve_route_cycle_alert_humidity_event(event, info=info) for event in persisted_events]
        )

    departure_coordinate = (
        Coordinate(latitude=route_cycle.departure_latitude, longitude=route_cycle.departure_longitude)
        if route_cycle.departure_latitude is not None and route_cycle.departure_longitude is not None
        else None
    )
    destination_coordinate = (
        Coordinate(latitude=route_cycle.destination_latitude, longitude=route_cycle.destination_longitude)
        if route_cycle.destination_latitude is not None and route_cycle.destination_longitude is not None
        else None
    )

    return RouteCycle(
        id=strawberry.scalars.ID(route_cycle.id),
        _node_coldtag=__node_coldtag(),
        identifier=route_cycle.identifier,
        description=route_cycle.description,
        owner_name=route_cycle.owner_name,
        placed_at=route_cycle.placed_at,
        departure_coordinate=departure_coordinate,
        destination_coordinate=destination_coordinate,
        temperature_alert_threshold=route_cycle.temperature_alert_threshold,
        humidity_alert_threshold=route_cycle.humidity_alert_threshold,
        started=route_cycle.started,
        completed=route_cycle.completed,
        canceled=route_cycle.canceled,
        dispatch_time=route_cycle.dispatch_time,
        completion_time=route_cycle.completion_time,
        _telemetry_events=__telemetry_events(),
        _alert_liquid_events=__alert_liquid_events(),
        _alert_impact_events=__alert_impact_events(),
        _alert_temperature_events=__alert_temperature_events(),
        _alert_humidity_events=__alert_humidity_events(),
        created_time=route_cycle.created_time,
        updated_time=route_cycle.updated_time,
    )
