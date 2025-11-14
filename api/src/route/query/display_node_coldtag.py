import asyncio
from typing import TYPE_CHECKING, cast

import strawberry
from fastapi import HTTPException, status
from strawberry import Info

from src.route.resolve.node_coldtag import NodeColdtag, resolve_node_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class NodeColdtagDisplay:
    @strawberry.type
    class DisplayNodeColdtagFields:
        @strawberry.field
        async def all(self, info: Info["AppContext"]) -> list[NodeColdtag]:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_nodes = await node_coldtag_persistence.find_nodes()
            return cast(
                "list[NodeColdtag]",
                await asyncio.gather(*[resolve_node_coldtag(node, info=info) for node in persisted_nodes]),
            )

        @strawberry.field
        async def all_available_for_route_cycle(self, info: Info["AppContext"]) -> list[NodeColdtag]:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_nodes = await node_coldtag_persistence.find_nodes_available_for_route_cycle()
            return cast(
                "list[NodeColdtag]",
                await asyncio.gather(*[resolve_node_coldtag(node, info=info) for node in persisted_nodes]),
            )

        @strawberry.field
        async def by_id(self, node_id: strawberry.scalars.ID, info: Info["AppContext"]) -> NodeColdtag:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_node = await node_coldtag_persistence.find_node_by_id(node_id)

            if persisted_node is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

            return await resolve_node_coldtag(persisted_node, info=info)

        @strawberry.field
        async def count(self, info: Info["AppContext"]) -> int:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            return await node_coldtag_persistence.count_nodes()

    @strawberry.field
    async def display_node_coldtag(self) -> DisplayNodeColdtagFields:
        return NodeColdtagDisplay.DisplayNodeColdtagFields()
