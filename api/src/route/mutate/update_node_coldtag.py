from typing import TYPE_CHECKING

import strawberry
from fastapi import HTTPException, status
from strawberry.types import Info

from src.persistence import MISSING
from src.route.resolve.coldtag import NodeColdtag, resolve_node_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class NodeColdtagUpdate:
    @strawberry.field
    async def update_node_coldtag(
        self,
        node_coldtag_id: strawberry.scalars.ID,
        info: Info["AppContext"],
        identifier: str | None = None,
    ) -> NodeColdtag:
        coldtag_persistence = info.context.coldtag_persistence

        persisted_node = await coldtag_persistence.find_node_by_id(node_coldtag_id)

        if persisted_node is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if persisted_node.deleted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Illegal operation on deleted item.")

        updated_persisted_node = await coldtag_persistence.update_node(
            node_coldtag_id,
            identifier=MISSING if identifier is None else identifier,
        )
        return await resolve_node_coldtag(updated_persisted_node, info=info)
