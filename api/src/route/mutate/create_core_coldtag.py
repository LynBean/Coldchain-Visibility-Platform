from typing import TYPE_CHECKING

import strawberry
from strawberry.types import Info

from src.route.resolve.coldtag import CoreColdtag, resolve_core_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagCreate:
    @strawberry.field
    async def create_core_coldtag(
        self,
        mac_address: str,
        info: Info["AppContext"],
        identifier: str | None = None,
    ) -> CoreColdtag:
        coldtag_persistence = info.context.coldtag_persistence

        persisted_core = await coldtag_persistence.create_core(
            mac_address=mac_address,
            identifier=identifier,
        )
        return await resolve_core_coldtag(persisted_core, info=info)
