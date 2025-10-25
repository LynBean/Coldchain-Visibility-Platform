import asyncio
from typing import TYPE_CHECKING, cast

import strawberry
from fastapi import HTTPException, status
from strawberry import Info

from src.route.resolve.coldtag import CoreColdtag, resolve_core_coldtag

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagDisplay:
    @strawberry.type
    class DisplayCoreColdtagFields:
        @strawberry.field
        async def all(self, info: Info["AppContext"]) -> list[CoreColdtag]:
            coldtag_persistence = info.context.coldtag_persistence
            persisted_cores = await coldtag_persistence.find_cores()
            return cast(
                "list[CoreColdtag]",
                await asyncio.gather(*[resolve_core_coldtag(core, info=info) for core in persisted_cores]),
            )

        @strawberry.field
        async def by_id(self, core_id: strawberry.scalars.ID, info: Info["AppContext"]) -> CoreColdtag:
            coldtag_persistence = info.context.coldtag_persistence
            persisted_core = await coldtag_persistence.find_core_by_id(core_id)

            if persisted_core is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

            return await resolve_core_coldtag(persisted_core, info=info)

    @strawberry.field
    async def display_core_coldtag(self) -> DisplayCoreColdtagFields:
        return CoreColdtagDisplay.DisplayCoreColdtagFields()
