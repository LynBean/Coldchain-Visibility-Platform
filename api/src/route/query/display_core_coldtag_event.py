import asyncio
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry
from strawberry import Info

from src.route.resolve.core_coldtag import (
    CoreColdtagEvent,
    resolve_core_coldtag_event,
)

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagEventDisplay:
    @strawberry.type
    class DisplayCoreColdtagEventFields:
        @strawberry.field
        async def all_by_time_range(
            self, a: datetime, info: Info["AppContext"], b: datetime | None = None
        ) -> list[CoreColdtagEvent]:
            core_coldtag_persistence = info.context.core_coldtag_persistence
            persisted_events = await core_coldtag_persistence.find_core_events_all_by_time_range(a, b)
            return await asyncio.gather(*[resolve_core_coldtag_event(event, info=info) for event in persisted_events])

    @strawberry.field
    async def display_core_coldtag_event(self) -> DisplayCoreColdtagEventFields:
        return CoreColdtagEventDisplay.DisplayCoreColdtagEventFields()
