from typing import TYPE_CHECKING

import strawberry
from strawberry.types import Info

from src.route.resolve.node_coldtag import NodeColdtag, resolve_node_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class NodeColdtagDelete:
    @strawberry.field
    async def delete_node_coldtag(
        self, node_coldtag_id: strawberry.scalars.ID, info: Info["AppContext"]
    ) -> NodeColdtag:
        node_coldtag_persistence = info.context.node_coldtag_persistence

        persisted_node = await node_coldtag_persistence.update_node(node_coldtag_id, deleted=True)
        return await resolve_node_coldtag(persisted_node, info=info)
