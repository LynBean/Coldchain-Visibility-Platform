import asyncio
from collections.abc import Awaitable
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry

from src.persistence.route_cycle import PersistedRouteCycle
from src.route.resolve.coordinate import Coordinate
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
        created_time=route_cycle.created_time,
        updated_time=route_cycle.updated_time,
    )
