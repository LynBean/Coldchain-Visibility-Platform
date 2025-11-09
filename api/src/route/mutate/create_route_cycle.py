from typing import TYPE_CHECKING

import strawberry
from strawberry.types import Info

from src.route.resolve.route_cycle import RouteCycle, resolve_route_cycle

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class RouteCycleCreate:
    @strawberry.field
    async def create_route_cycle(
        self,
        node_coldtag_id: str,
        info: Info["AppContext"],
        identifier: str | None = None,
        description: str | None = None,
        owner_name: str | None = None,
        placed_at: str | None = None,
        departure_latitude: float | None = None,
        departure_longitude: float | None = None,
        destination_latitude: float | None = None,
        destination_longitude: float | None = None,
        temperature_alert_threshold: float | None = None,
        humidity_alert_threshold: float | None = None,
    ) -> RouteCycle:
        route_cycle_persistence = info.context.route_cycle_persistence

        persisted_route_cycle = await route_cycle_persistence.create_route_cycle(
            node_coldtag_id=node_coldtag_id,
            identifier=identifier,
            description=description,
            owner_name=owner_name,
            placed_at=placed_at,
            departure_latitude=departure_latitude,
            departure_longitude=departure_longitude,
            destination_latitude=destination_latitude,
            destination_longitude=destination_longitude,
            temperature_alert_threshold=temperature_alert_threshold,
            humidity_alert_threshold=humidity_alert_threshold,
        )

        return await resolve_route_cycle(persisted_route_cycle, info=info)
