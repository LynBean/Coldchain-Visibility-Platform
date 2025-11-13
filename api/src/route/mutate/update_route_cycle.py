from typing import TYPE_CHECKING

import strawberry
from fastapi import HTTPException, status
from strawberry.types import Info

from src.persistence import MISSING
from src.route.resolve.route_cycle import RouteCycle, resolve_route_cycle

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class RouteCycleUpdate:
    @strawberry.field
    async def update_route_cycle(
        self,
        route_cycle_id: strawberry.scalars.ID,
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

        persisted_route_cycle = await route_cycle_persistence.find_route_cycle_by_id(route_cycle_id)

        if persisted_route_cycle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if persisted_route_cycle.completed or persisted_route_cycle.canceled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Illegal operation on ended route.")

        updated_persisted_route_cycle = await route_cycle_persistence.update_route_cycle(
            route_cycle_id,
            identifier=MISSING if identifier is None else identifier,
            description=MISSING if description is None else description,
            owner_name=MISSING if owner_name is None else owner_name,
            placed_at=MISSING if placed_at is None else placed_at,
            departure_latitude=MISSING if departure_latitude is None else departure_latitude,
            departure_longitude=MISSING if departure_longitude is None else departure_longitude,
            destination_latitude=MISSING if destination_latitude is None else destination_latitude,
            destination_longitude=MISSING if destination_longitude is None else destination_longitude,
            temperature_alert_threshold=MISSING if temperature_alert_threshold is None else temperature_alert_threshold,
            humidity_alert_threshold=MISSING if humidity_alert_threshold is None else humidity_alert_threshold,
        )
        return await resolve_route_cycle(updated_persisted_route_cycle, info=info)

    @strawberry.field
    async def start_route_cycle(
        self,
        route_cycle_id: strawberry.scalars.ID,
        info: Info["AppContext"],
    ) -> RouteCycle:
        route_cycle_persistence = info.context.route_cycle_persistence

        persisted_route_cycle = await route_cycle_persistence.find_route_cycle_by_id(route_cycle_id)

        if persisted_route_cycle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if persisted_route_cycle.started or persisted_route_cycle.completed or persisted_route_cycle.canceled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        updated_persisted_route_cycle = await route_cycle_persistence.update_route_cycle(
            route_cycle_id,
            started=True,
        )
        return await resolve_route_cycle(updated_persisted_route_cycle, info=info)

    @strawberry.field
    async def complete_route_cycle(
        self,
        route_cycle_id: strawberry.scalars.ID,
        info: Info["AppContext"],
    ) -> RouteCycle:
        route_cycle_persistence = info.context.route_cycle_persistence

        persisted_route_cycle = await route_cycle_persistence.find_route_cycle_by_id(route_cycle_id)

        if persisted_route_cycle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if not persisted_route_cycle.started or persisted_route_cycle.completed or persisted_route_cycle.canceled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        updated_persisted_route_cycle = await route_cycle_persistence.update_route_cycle(
            route_cycle_id,
            completed=True,
        )
        return await resolve_route_cycle(updated_persisted_route_cycle, info=info)

    @strawberry.field
    async def cancel_route_cycle(
        self,
        route_cycle_id: strawberry.scalars.ID,
        info: Info["AppContext"],
    ) -> RouteCycle:
        route_cycle_persistence = info.context.route_cycle_persistence

        persisted_route_cycle = await route_cycle_persistence.find_route_cycle_by_id(route_cycle_id)

        if persisted_route_cycle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if persisted_route_cycle.completed or persisted_route_cycle.canceled:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

        updated_persisted_route_cycle = await route_cycle_persistence.update_route_cycle(
            route_cycle_id,
            canceled=True,
        )
        return await resolve_route_cycle(updated_persisted_route_cycle, info=info)
