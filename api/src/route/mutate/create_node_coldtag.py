from typing import TYPE_CHECKING

import strawberry
from strawberry.types import Info

from src.route.resolve.coldtag import NodeColdtag, resolve_node_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class NodeColdtagCreate:
    @strawberry.field
    async def create_node_coldtag(
        self,
        mac_address: str,
        info: Info["AppContext"],
        identifier: str | None = None,
    ) -> NodeColdtag:
        coldtag_persistence = info.context.coldtag_persistence

        persisted_node = await coldtag_persistence.create_node(
            mac_address=mac_address,
            identifier=identifier,
        )
        return await resolve_node_coldtag(persisted_node, info=info)
