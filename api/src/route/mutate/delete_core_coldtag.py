from typing import TYPE_CHECKING

import strawberry
from strawberry.types import Info

from src.route.resolve.coldtag import CoreColdtag, resolve_core_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagDelete:
    @strawberry.field
    async def delete_core_coldtag(
        self, core_coldtag_id: strawberry.scalars.ID, info: Info["AppContext"]
    ) -> CoreColdtag:
        coldtag_persistence = info.context.coldtag_persistence

        persisted_core = await coldtag_persistence.update_core(core_coldtag_id, deleted=True)
        return await resolve_core_coldtag(persisted_core, info=info)
