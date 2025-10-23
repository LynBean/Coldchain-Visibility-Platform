from typing import TYPE_CHECKING

import strawberry
from fastapi import HTTPException, status
from strawberry.types import Info

from src.persistence import MISSING
from src.route.resolve.coldtag import CoreColdtag, resolve_core_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagUpdate:
    @strawberry.field
    async def update_core_coldtag(
        self,
        core_coldtag_id: strawberry.scalars.ID,
        info: Info["AppContext"],
        identifier: str | None = None,
    ) -> CoreColdtag:
        coldtag_persistence = info.context.coldtag_persistence

        persisted_core = await coldtag_persistence.find_core_by_id(core_coldtag_id)

        if persisted_core is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        if persisted_core.deleted:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Illegal operation on deleted item.")

        updated_persisted_core = await coldtag_persistence.update_core(
            core_coldtag_id,
            identifier=MISSING if identifier is None else identifier,
        )
        return await resolve_core_coldtag(updated_persisted_core, info=info)
