import asyncio
import re
from datetime import datetime
from typing import cast

from asyncpg import Connection as PgConnection
from asyncpg import Pool as PgPool
from asyncpg import Record as PgRecord
from fastapi import FastAPI

from src.persistence import MISSING, BasePersistence, InsertConstructor, MissingType

from .model import (
    PersistedCoreColdtag,
    PersistedCoreColdtagEvent,
)
from .schema import (
    CoreColdtagEventSchema,
    CoreColdtagSchema,
)

__all__ = [
    "CoreColdtagEventSchema",
    "CoreColdtagSchema",
    "PersistedCoreColdtag",
    "PersistedCoreColdtagEvent",
]


def _is_valid_mac_address(address: str, /) -> bool:
    return bool(re.fullmatch(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", address))


class CoreColdtagPersistence(BasePersistence):
    def __init__(self, app: FastAPI, pool: PgPool) -> None:
        super().__init__(app, pool=pool)

    async def is_core_exists_by_id(self, core_id: str, /) -> bool:
        async def __query(client: PgConnection) -> bool:
            row = await client.fetchval(
                """
                SELECT id FROM create_core_coldtag
                WHERE id = $1
                """,
                int(core_id),
            )
            return row is not None

        return await self._commit(__query)

    async def is_core_exists_by_mac_address(self, mac_address: str, /) -> bool:
        async def __query(client: PgConnection) -> bool:
            row = await client.fetchval(
                """
                SELECT id FROM create_core_coldtag
                WHERE mac_address = $1
                """,
                mac_address,
            )
            return row is not None

        return await self._commit(__query)

    async def count_cores(self) -> int:
        async def __query(client: PgConnection) -> int:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT COUNT(*) AS count
                    FROM core_coldtag
                """
                ),
            )
            return row["count"]

        return await self._commit(__query)

    async def find_cores(self) -> list[PersistedCoreColdtag]:
        async def __query(client: PgConnection) -> list[CoreColdtagSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM core_coldtag
                    """
            )
            return [CoreColdtagSchema(**row) for row in rows]

        core_coldtag_schemas = await self._commit(__query)
        return cast(
            "list[PersistedCoreColdtag]",
            await asyncio.gather(
                *[PersistedCoreColdtag.construct_model(self._app, schema) for schema in core_coldtag_schemas]
            ),
        )

    async def find_core_by_id(self, coldtag_id: str, /) -> PersistedCoreColdtag | None:
        async def __query(client: PgConnection) -> CoreColdtagSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM core_coldtag
                    WHERE id = $1
                    """,
                    int(coldtag_id),
                ),
            )
            if not row:
                return None

            return CoreColdtagSchema(**row)

        core_coldtag_schema = await self._commit(__query)
        if core_coldtag_schema is None:
            return None

        return await PersistedCoreColdtag.construct_model(self._app, core_coldtag_schema)

    async def find_core_by_mac_address(self, mac_address: str, /) -> PersistedCoreColdtag | None:
        async def __query(client: PgConnection) -> CoreColdtagSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM core_coldtag
                    WHERE mac_address = $1
                    """,
                    mac_address,
                ),
            )
            if not row:
                return None

            return CoreColdtagSchema(**row)

        core_coldtag_schema = await self._commit(__query)
        if core_coldtag_schema is None:
            return None

        return await PersistedCoreColdtag.construct_model(self._app, core_coldtag_schema)

    async def find_core_events_by_core_id(self, core_id: str, /) -> list[PersistedCoreColdtagEvent]:
        async def __query(client: PgConnection) -> list[PersistedCoreColdtagEvent]:
            rows = await client.fetch(
                """
                    SELECT * FROM core_coldtag_event
                    WHERE core_coldtag_id = $1
                    """,
                int(core_id),
            )

            return cast(
                "list[PersistedCoreColdtagEvent]",
                await asyncio.gather(
                    *[
                        PersistedCoreColdtagEvent.construct_model(self._app, CoreColdtagEventSchema(**row))
                        for row in rows
                    ]
                ),
            )

        return await self._commit(__query)

    async def find_core_events_all_by_time_range(
        self, /, a: datetime, b: datetime | None = None
    ) -> list[PersistedCoreColdtagEvent]:
        async def __query(client: PgConnection) -> list[PersistedCoreColdtagEvent]:
            rows = await client.fetch(
                """
                    SELECT * FROM core_coldtag_event
                    WHERE event_time >= $1
                    AND ($2::timestamptz IS NULL OR event_time <= $2)
                """,
                a,
                b,
            )
            return cast(
                "list[PersistedCoreColdtagEvent]",
                await asyncio.gather(
                    *[
                        PersistedCoreColdtagEvent.construct_model(self._app, CoreColdtagEventSchema(**row))
                        for row in rows
                    ]
                ),
            )

        return await self._commit(__query)

    async def find_core_event_by_closest_time(
        self, core_id: str, /, time: datetime
    ) -> PersistedCoreColdtagEvent | None:
        async def __query(client: PgConnection) -> PersistedCoreColdtagEvent | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                        SELECT * FROM core_coldtag_event
                        WHERE core_coldtag_id = $1
                        ORDER BY ABS(EXTRACT(EPOCH FROM (event_time - $2))) ASC
                        LIMIT 1
                    """,
                    int(core_id),
                    time,
                ),
            )
            if row is None:
                return None

            return await PersistedCoreColdtagEvent.construct_model(self._app, CoreColdtagEventSchema(**row))

        return await self._commit(__query)

    async def create_core(self, *, mac_address: str, identifier: str | None = None) -> PersistedCoreColdtag:
        assert _is_valid_mac_address(mac_address), "Invalid MAC Address."

        async def __query(client: PgConnection) -> CoreColdtagSchema:
            core_id = cast(
                "int",
                await client.fetchval(
                    """
                    INSERT INTO create_core_coldtag (
                        mac_address,
                        identifier
                    ) VALUES (
                        $1,
                        $2
                    ) RETURNING id
                    """,
                    mac_address,
                    identifier,
                ),
            )
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT *
                    FROM core_coldtag
                    WHERE id = $1
                    """,
                    core_id,
                ),
            )
            assert row is not None
            return CoreColdtagSchema(**row)

        schema = await self._commit(__query)
        return await PersistedCoreColdtag.construct_model(self._app, schema)

    async def update_core(
        self,
        core_id: str,
        /,
        *,
        identifier: str | None | MissingType = MISSING,
        deleted: bool | None | MissingType = MISSING,
    ) -> PersistedCoreColdtag:
        assert identifier is not MISSING or deleted is not MISSING

        persisted_core = await self.find_core_by_id(core_id)
        assert persisted_core is not None

        async def __query(client: PgConnection) -> None:
            sql = InsertConstructor([int(core_id)])

            if identifier is not MISSING:
                sql.add("identifier", identifier)
            if deleted is not MISSING:
                sql.add("deleted", deleted)

            await client.execute(
                sql.query(
                    """
                    INSERT INTO update_core_coldtag (
                        core_coldtag_id,
                        $COLUMNS
                    ) VALUES (
                        $1,
                        $VALUES
                    )
                    """,
                ),
                *sql.values,
            )

        await self._commit(__query)
        updated_persisted_core = await self.find_core_by_id(core_id)
        assert updated_persisted_core is not None
        return updated_persisted_core

    async def create_core_event(
        self,
        core_id: str,
        /,
        *,
        latitude: float | None,
        longitude: float | None,
        time: datetime,
    ) -> PersistedCoreColdtagEvent:
        async def __query(client: PgConnection) -> CoreColdtagEventSchema:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    INSERT INTO core_coldtag_event (
                        core_coldtag_id,
                        latitude,
                        longitude,
                        event_time
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    ) RETURNING *
                    """,
                    int(core_id),
                    latitude,
                    longitude,
                    time,
                ),
            )
            assert row is not None
            return CoreColdtagEventSchema(**row)

        schema = await self._commit(__query)
        return await PersistedCoreColdtagEvent.construct_model(self._app, schema)
