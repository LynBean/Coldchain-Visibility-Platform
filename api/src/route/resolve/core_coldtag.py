import asyncio
from collections.abc import Callable, Coroutine
from datetime import datetime
from typing import TYPE_CHECKING, Any

import strawberry

from src.persistence.core_coldtag import (
    PersistedCoreColdtag,
    PersistedCoreColdtagEvent,
)
from src.route.resolve.coordinate import Coordinate

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class CoreColdtagEvent:
    id: strawberry.scalars.ID

    _core_coldtag: strawberry.Private[Callable[..., Coroutine[Any, Any, "CoreColdtag"]]]

    @strawberry.field
    async def core_coldtag(self) -> "CoreColdtag":
        return await self._core_coldtag()

    coordinate: Coordinate | None
    event_time: datetime
    time: datetime


async def resolve_core_coldtag_event(
    coldtag_event: PersistedCoreColdtagEvent, /, info: strawberry.Info["AppContext"]
) -> CoreColdtagEvent:
    async def __core_coldtag() -> CoreColdtag:
        core_coldtag = await coldtag_event.core_coldtag()
        return await resolve_core_coldtag(core_coldtag, info=info)

    coordinate = (
        Coordinate(latitude=coldtag_event.latitude, longitude=coldtag_event.longitude)
        if isinstance(coldtag_event.latitude, float) and isinstance(coldtag_event.longitude, float)
        else None
    )

    return CoreColdtagEvent(
        id=strawberry.scalars.ID(coldtag_event.id),
        _core_coldtag=__core_coldtag,
        coordinate=coordinate,
        event_time=coldtag_event.event_time,
        time=coldtag_event.time,
    )


@strawberry.type
class CoreColdtag:
    id: strawberry.scalars.ID
    mac_address: str
    identifier: str | None

    _telemetry_events: strawberry.Private[Callable[..., Coroutine[Any, Any, list[CoreColdtagEvent]]]]

    @strawberry.field
    async def telemetry_events(self) -> list[CoreColdtagEvent]:
        return await self._telemetry_events()

    deleted: bool
    created_time: datetime
    updated_time: datetime


async def resolve_core_coldtag(
    core_coldtag: PersistedCoreColdtag, /, info: strawberry.Info["AppContext"]
) -> CoreColdtag:
    async def __telemetry_events() -> list[CoreColdtagEvent]:
        persisted_events = await core_coldtag.telemetry_events()
        return await asyncio.gather(*[resolve_core_coldtag_event(event, info=info) for event in persisted_events])

    return CoreColdtag(
        id=strawberry.scalars.ID(core_coldtag.id),
        mac_address=core_coldtag.mac_address,
        identifier=core_coldtag.identifier,
        _telemetry_events=__telemetry_events,
        deleted=core_coldtag.deleted,
        created_time=core_coldtag.created_time,
        updated_time=core_coldtag.updated_time,
    )
