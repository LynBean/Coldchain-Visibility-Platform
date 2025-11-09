from collections.abc import Awaitable
from datetime import datetime
from typing import TYPE_CHECKING

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

from .schema import (
    CoreColdtagEventSchema,
    CoreColdtagSchema,
)

if TYPE_CHECKING:
    from src.persistence.core_coldtag import CoreColdtagPersistence


class PersistedCoreColdtagEvent(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    core_coldtag: Awaitable["PersistedCoreColdtag"]
    latitude: float | None
    longitude: float | None
    event_time: datetime
    time: datetime

    @staticmethod
    async def construct_model(app: FastAPI, data: CoreColdtagEventSchema, /) -> "PersistedCoreColdtagEvent":
        async def __core_coldtag() -> PersistedCoreColdtag:
            core_coldtag_persistence: CoreColdtagPersistence = app.extra["core_coldtag_persistence"]
            persisted_core_coldtag = await core_coldtag_persistence.find_core_by_id(str(data.core_coldtag_id))
            assert persisted_core_coldtag is not None
            return persisted_core_coldtag

        return PersistedCoreColdtagEvent(
            id=str(data.id),
            core_coldtag=__core_coldtag(),
            latitude=data.latitude,
            longitude=data.longitude,
            event_time=data.event_time,
            time=data.time,
        )


class PersistedCoreColdtag(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    id: str
    mac_address: str
    identifier: str | None
    telemetry_events: Awaitable[list["PersistedCoreColdtagEvent"]]
    deleted: bool
    created_time: datetime
    updated_time: datetime

    @staticmethod
    async def construct_model(app: FastAPI, data: CoreColdtagSchema, /) -> "PersistedCoreColdtag":
        async def __telemetry_events() -> list["PersistedCoreColdtagEvent"]:
            core_coldtag_event_persistence: CoreColdtagPersistence = app.extra["core_coldtag_event_persistence"]
            events = await core_coldtag_event_persistence.find_core_events_by_core_id(str(data.id))
            return sorted(events, key=lambda x: x.event_time, reverse=True)

        return PersistedCoreColdtag(
            id=str(data.id),
            mac_address=data.mac_address,
            identifier=data.identifier,
            telemetry_events=__telemetry_events(),
            deleted=bool(data.deleted),
            created_time=data.created_time,
            updated_time=data.updated_time,
        )
