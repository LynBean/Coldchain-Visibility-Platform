from collections.abc import Awaitable
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry

from src.persistence.route_cycle import PersistedRouteCycle
from src.route.resolve.node_coldtag import NodeColdtag, resolve_node_coldtag

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


async def resolve_route_cycle(route_cycle: PersistedRouteCycle, /, info: strawberry.Info["AppContext"]) -> RouteCycle:
    async def __node_coldtag() -> NodeColdtag:
        node_coldtag = await route_cycle.node_coldtag
        return await resolve_node_coldtag(node_coldtag, info=info)

    return RouteCycle(
        id=strawberry.scalars.ID(route_cycle.id),
        _node_coldtag=__node_coldtag(),
        identifier=route_cycle.identifier,
        description=route_cycle.description,
        owner_name=route_cycle.owner_name,
        placed_at=route_cycle.placed_at,
        departure_latitude=route_cycle.departure_latitude,
        departure_longitude=route_cycle.departure_longitude,
        destination_latitude=route_cycle.destination_latitude,
        destination_longitude=route_cycle.destination_longitude,
        temperature_alert_threshold=route_cycle.temperature_alert_threshold,
        humidity_alert_threshold=route_cycle.humidity_alert_threshold,
        completed=route_cycle.completed,
        canceled=route_cycle.canceled,
        created_time=route_cycle.created_time,
        updated_time=route_cycle.updated_time,
    )
