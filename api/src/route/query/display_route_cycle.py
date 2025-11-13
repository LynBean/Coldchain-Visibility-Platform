import asyncio
from typing import TYPE_CHECKING, cast

import strawberry
from fastapi import HTTPException, status
from strawberry import Info

from src.route.resolve.route_cycle import RouteCycle, resolve_route_cycle

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class RouteCycleDisplay:
    @strawberry.type
    class DisplayRouteCycleFields:
        @strawberry.field
        async def all(self, info: Info["AppContext"]) -> list[RouteCycle]:
            route_cycle_persistence = info.context.route_cycle_persistence
            persisted_route_cycles = await route_cycle_persistence.find_route_cycles()
            return cast(
                "list[RouteCycle]",
                await asyncio.gather(
                    *[resolve_route_cycle(route_cycle, info=info) for route_cycle in persisted_route_cycles]
                ),
            )

        @strawberry.field
        async def by_id(self, route_cycle_id: strawberry.scalars.ID, info: Info["AppContext"]) -> RouteCycle:
            route_cycle_persistence = info.context.route_cycle_persistence
            persisted_route_cycle = await route_cycle_persistence.find_route_cycle_by_id(route_cycle_id)

            if persisted_route_cycle is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await resolve_route_cycle(persisted_route_cycle, info=info)

        @strawberry.field
        async def latest_by_node_coldtag_id(
            self, node_id: strawberry.scalars.ID, info: Info["AppContext"]
        ) -> RouteCycle:
            route_cycle_persistence = info.context.route_cycle_persistence
            persisted_route_cycle = await route_cycle_persistence.find_latest_route_cycle_by_node_id(node_id)

            if persisted_route_cycle is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await resolve_route_cycle(persisted_route_cycle, info=info)

    @strawberry.field
    async def display_route_cycle(self) -> DisplayRouteCycleFields:
        return RouteCycleDisplay.DisplayRouteCycleFields()
