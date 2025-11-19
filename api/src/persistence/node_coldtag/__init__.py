import asyncio
import re
from datetime import datetime
from typing import cast

import orjson
from asyncpg import Connection as PgConnection
from asyncpg import Pool as PgPool
from asyncpg import Record as PgRecord
from fastapi import FastAPI

from src.persistence import MISSING, BasePersistence, InsertConstructor, MissingType

from .model import (
    PersistedNodeColdtag,
    PersistedNodeColdtagEvent,
    PersistedNodeColdtagEventAlertImpact,
    PersistedNodeColdtagEventAlertLiquid,
)
from .schema import (
    NodeColdtagEventAlertImpactSchema,
    NodeColdtagEventAlertLiquidSchema,
    NodeColdtagEventSchema,
    NodeColdtagSchema,
)

__all__ = [
    "NodeColdtagEventAlertImpactSchema",
    "NodeColdtagEventAlertLiquidSchema",
    "NodeColdtagEventSchema",
    "NodeColdtagSchema",
    "PersistedNodeColdtag",
    "PersistedNodeColdtagEvent",
    "PersistedNodeColdtagEventAlertImpact",
    "PersistedNodeColdtagEventAlertLiquid",
]


def _is_valid_mac_address(address: str, /) -> bool:
    return bool(re.fullmatch(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", address))


class NodeColdtagPersistence(BasePersistence):
    def __init__(self, app: FastAPI, pool: PgPool) -> None:
        super().__init__(app, pool=pool)

    async def is_node_exists_by_id(self, node_id: str, /) -> bool:
        async def __query(client: PgConnection) -> bool:
            row = await client.fetchval(
                """
                SELECT id FROM create_node_coldtag
                WHERE id = $1
                """,
                int(node_id),
            )
            return row is not None

        return await self._commit(__query)

    async def is_node_exists_by_mac_address(self, mac_address: str, /) -> bool:
        async def __query(client: PgConnection) -> bool:
            row = await client.fetchval(
                """
                SELECT id FROM create_node_coldtag
                WHERE mac_address = $1
                """,
                mac_address,
            )
            return row is not None

        return await self._commit(__query)

    async def count_nodes(self) -> int:
        async def __query(client: PgConnection) -> int:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT COUNT(*) AS count
                    FROM node_coldtag
                """
                ),
            )
            return row["count"]

        return await self._commit(__query)

    async def find_nodes(self) -> list[PersistedNodeColdtag]:
        async def __query(client: PgConnection) -> list[NodeColdtagSchema]:
            rows = await client.fetch(
                """
                SELECT * FROM node_coldtag
                """
            )
            return [NodeColdtagSchema(**row) for row in rows]

        node_coldtag_schemas = await self._commit(__query)
        return cast(
            "list[PersistedNodeColdtag]",
            await asyncio.gather(
                *[PersistedNodeColdtag.construct_model(self._app, schema) for schema in node_coldtag_schemas]
            ),
        )

    async def find_nodes_available_for_route_cycle(self) -> list[PersistedNodeColdtag]:
        async def __query(client: PgConnection) -> list[NodeColdtagSchema]:
            rows = await client.fetch(
                """
                SELECT
                  NC.*
                FROM
                  "node_coldtag" NC
                WHERE
                  NOT EXISTS (
                    SELECT
                      1
                    FROM
                      "route_cycle" RC
                    WHERE
                      RC.NODE_COLDTAG_ID = NC.ID
                      AND (
                        RC.COMPLETED IS DISTINCT FROM TRUE
                        AND RC.CANCELED IS DISTINCT FROM TRUE
                      )
                      AND RC.ID = (
                        SELECT
                          RC2.ID
                        FROM
                          "route_cycle" RC2
                        WHERE
                          RC2.NODE_COLDTAG_ID = NC.ID
                        ORDER BY
                          RC2.ID DESC
                        LIMIT
                          1
                      )
                  )
                ORDER BY
                  NC.ID;
                """
            )
            return [NodeColdtagSchema(**row) for row in rows]

        node_coldtag_schemas = await self._commit(__query)
        return cast(
            "list[PersistedNodeColdtag]",
            await asyncio.gather(
                *[PersistedNodeColdtag.construct_model(self._app, schema) for schema in node_coldtag_schemas]
            ),
        )

    async def find_node_by_id(self, coldtag_id: str, /) -> PersistedNodeColdtag | None:
        cache_key = f"node_coldtag_by_id:{coldtag_id}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> NodeColdtagSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM node_coldtag
                    WHERE id = $1
                    """,
                    int(coldtag_id),
                ),
            )
            if row is None:
                return None

            await self._redis.set(cache_key, orjson.dumps(dict(row)))
            return NodeColdtagSchema(**row)

        schema = NodeColdtagSchema(**orjson.loads(cached)) if cached else await self._commit(__query)
        if schema is None:
            return None

        return await PersistedNodeColdtag.construct_model(self._app, schema)

    async def find_node_by_mac_address(self, mac_address: str, /) -> PersistedNodeColdtag | None:
        cache_key = f"node_coldtag_by_mac_address:{mac_address}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> NodeColdtagSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM node_coldtag
                    WHERE mac_address = $1
                    """,
                    mac_address,
                ),
            )
            if row is None:
                return None

            await self._redis.set(cache_key, orjson.dumps(dict(row)))
            return NodeColdtagSchema(**row)

        schema = NodeColdtagSchema(**orjson.loads(cached)) if cached else await self._commit(__query)
        if schema is None:
            return None

        return await PersistedNodeColdtag.construct_model(self._app, schema)

    async def find_node_events_by_node_id(self, node_id: str, /) -> list[PersistedNodeColdtagEvent]:
        cache_key = f"node_coldtag_events_by_node_id:{node_id}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event
                    WHERE node_coldtag_id = $1
                """,
                int(node_id),
            )
            await self._redis.set(cache_key, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventSchema(**row) for row in orjson.loads(cached)] if cached else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEvent]",
            await asyncio.gather(*[PersistedNodeColdtagEvent.construct_model(self._app, schema) for schema in schemas]),
        )

    async def find_node_events_all_by_time_range(
        self, /, a: datetime, b: datetime | None = None
    ) -> list[PersistedNodeColdtagEvent]:
        cache_key = f"node_coldtag_events_all_by_time_range:{a.timestamp()}:{b.timestamp() if b is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event
                    WHERE event_time >= $1
                    AND ($2::timestamptz IS NULL OR event_time <= $2)
                """,
                a,
                b,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventSchema(**row) for row in orjson.loads(cached)] if cached else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEvent]",
            await asyncio.gather(*[PersistedNodeColdtagEvent.construct_model(self._app, schema) for schema in schemas]),
        )

    async def find_node_events_by_time_range(
        self, node_id: str, /, dispatch_time: datetime, completion_time: datetime | None = None
    ) -> list[PersistedNodeColdtagEvent]:
        cache_key = f"node_coldtag_events_by_time_range:{node_id}:{dispatch_time.timestamp()}:{completion_time.timestamp() if completion_time is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event
                    WHERE node_coldtag_id = $1
                    AND event_time >= $2
                    AND ($3::timestamptz IS NULL OR event_time <= $3)
                    """,
                int(node_id),
                dispatch_time,
                completion_time,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventSchema(**row) for row in orjson.loads(cached)] if cached else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEvent]",
            await asyncio.gather(*[PersistedNodeColdtagEvent.construct_model(self._app, schema) for schema in schemas]),
        )

    async def find_node_event_alert_impacts_by_node_id(
        self, node_id: str, /
    ) -> list[PersistedNodeColdtagEventAlertImpact]:
        cache_key = f"node_coldtag_event_alert_impacts_by_node_id:{node_id}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertImpactSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_impact
                    WHERE node_coldtag_id = $1
                """,
                int(node_id),
            )
            await self._redis.set(cache_key, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertImpactSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertImpactSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertImpact]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertImpact.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def find_node_event_alert_impacts_all_by_time_range(
        self, /, a: datetime, b: datetime | None = None
    ) -> list[PersistedNodeColdtagEventAlertImpact]:
        cache_key = f"node_coldtag_event_alert_impacts_all_by_time_range:{a.timestamp()}:{b.timestamp() if b is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertImpactSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_impact
                    WHERE event_time >= $1
                    AND ($2::timestamptz IS NULL OR event_time <= $2)
                """,
                a,
                b,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertImpactSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertImpactSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertImpact]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertImpact.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def find_node_event_alert_impacts_by_time_range(
        self, node_id: str, /, dispatch_time: datetime, completion_time: datetime | None = None
    ) -> list[PersistedNodeColdtagEventAlertImpact]:
        cache_key = f"node_coldtag_event_alert_impacts_by_time_range:{node_id}:{dispatch_time.timestamp()}:{completion_time.timestamp() if completion_time is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertImpactSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_impact
                    WHERE node_coldtag_id = $1
                    AND event_time >= $2
                    AND ($3::timestamptz IS NULL OR event_time <= $3)
                    """,
                int(node_id),
                dispatch_time,
                completion_time,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertImpactSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertImpactSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertImpact]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertImpact.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def find_node_event_alert_liquids_by_node_id(
        self, node_id: str, /
    ) -> list[PersistedNodeColdtagEventAlertLiquid]:
        cache_key = f"node_coldtag_event_alert_liquids_by_node_id:{node_id}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertLiquidSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_liquid
                    WHERE node_coldtag_id = $1
                """,
                int(node_id),
            )
            await self._redis.set(cache_key, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertLiquidSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertLiquidSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertLiquid]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertLiquid.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def find_node_event_alert_liquids_all_by_time_range(
        self, /, a: datetime, b: datetime | None = None
    ) -> list[PersistedNodeColdtagEventAlertLiquid]:
        cache_key = f"node_coldtag_event_alert_liquids_all_by_time_range:{a.timestamp()}:{b.timestamp() if b is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertLiquidSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_liquid
                    WHERE event_time >= $1
                    AND ($2::timestamptz IS NULL OR event_time <= $2)
                """,
                a,
                b,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertLiquidSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertLiquidSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertLiquid]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertLiquid.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def find_node_event_alert_liquids_by_time_range(
        self, node_id: str, /, dispatch_time: datetime, completion_time: datetime | None = None
    ) -> list[PersistedNodeColdtagEventAlertLiquid]:
        cache_key = f"node_coldtag_event_alert_liquids_by_time_range:{node_id}:{dispatch_time.timestamp()}:{completion_time.timestamp() if completion_time is not None else None}"
        cached = await self._redis.get(cache_key)

        async def __query(client: PgConnection) -> list[NodeColdtagEventAlertLiquidSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM node_coldtag_event_alert_liquid
                    WHERE node_coldtag_id = $1
                    AND event_time >= $2
                    AND ($3::timestamptz IS NULL OR event_time <= $3)
                    """,
                int(node_id),
                dispatch_time,
                completion_time,
            )
            await self._redis.setex(cache_key, 10, orjson.dumps([dict(r) for r in rows]))
            return [NodeColdtagEventAlertLiquidSchema(**row) for row in rows]

        schemas = (
            [NodeColdtagEventAlertLiquidSchema(**row) for row in orjson.loads(cached)]
            if cached
            else await self._commit(__query)
        )
        return cast(
            "list[PersistedNodeColdtagEventAlertLiquid]",
            await asyncio.gather(
                *[PersistedNodeColdtagEventAlertLiquid.construct_model(self._app, schema) for schema in schemas]
            ),
        )

    async def create_node(self, *, mac_address: str, identifier: str | None = None) -> PersistedNodeColdtag:
        assert _is_valid_mac_address(mac_address), "Invalid MAC Address."

        async def __query(client: PgConnection) -> NodeColdtagSchema:
            node_id = cast(
                "int",
                await client.fetchval(
                    """
                    INSERT INTO create_node_coldtag (
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
                    FROM node_coldtag
                    WHERE id = $1
                    """,
                    node_id,
                ),
            )
            assert row is not None
            return NodeColdtagSchema(**row)

        schema = await self._commit(__query)
        return await PersistedNodeColdtag.construct_model(self._app, schema)

    async def update_node(
        self,
        node_id: str,
        /,
        *,
        core_id: str | None | MissingType = MISSING,
        identifier: str | None | MissingType = MISSING,
        deleted: bool | None | MissingType = MISSING,
    ) -> PersistedNodeColdtag:
        assert identifier is not MISSING or deleted is not MISSING

        persisted_node = await self.find_node_by_id(node_id)
        assert persisted_node is not None

        async def __query(client: PgConnection) -> None:
            sql = InsertConstructor([int(node_id)])

            if core_id is not MISSING:
                sql.add("core_coldtag_id", int(core_id) if isinstance(core_id, str) else None)
            if identifier is not MISSING:
                sql.add("identifier", identifier)
            if deleted is not MISSING:
                sql.add("deleted", deleted)

            await client.execute(
                sql.query(
                    """
                    INSERT INTO update_node_coldtag (
                        node_coldtag_id,
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

        cache_keys = [f"node_coldtag_by_id:{node_id}", f"node_coldtag_by_mac_address:{persisted_node.mac_address}"]
        await self._redis.delete(*cache_keys)

        updated_persisted_node = await self.find_node_by_id(node_id)
        assert updated_persisted_node is not None
        return updated_persisted_node

    async def create_node_event(
        self,
        node_id: str,
        /,
        *,
        core_id: str,
        temperature: float | None = None,
        humidity: float | None = None,
        core_received_time: datetime,
        time: datetime,
    ) -> PersistedNodeColdtagEvent:
        async def __query(client: PgConnection) -> NodeColdtagEventSchema:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    INSERT INTO node_coldtag_event (
                        node_coldtag_id,
                        core_coldtag_id,
                        temperature,
                        humidity,
                        core_coldtag_received_time,
                        event_time
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6
                    ) RETURNING *
                    """,
                    int(node_id),
                    int(core_id),
                    temperature,
                    humidity,
                    core_received_time,
                    time,
                ),
            )
            assert row is not None
            return NodeColdtagEventSchema(**row)

        schema = await self._commit(__query)

        cache_keys = [f"node_coldtag_events_by_node_id:{node_id}"]
        await self._redis.delete(*cache_keys)

        return await PersistedNodeColdtagEvent.construct_model(self._app, schema)

    async def create_node_event_alert_liquid(
        self,
        node_id: str,
        /,
        *,
        core_id: str,
        core_received_time: datetime,
        time: datetime,
    ) -> PersistedNodeColdtagEventAlertLiquid:
        async def __query(client: PgConnection) -> NodeColdtagEventAlertLiquidSchema:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    INSERT INTO node_coldtag_event_alert_liquid (
                        node_coldtag_id,
                        core_coldtag_id,
                        core_coldtag_received_time,
                        event_time
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    ) RETURNING *
                    """,
                    int(node_id),
                    int(core_id),
                    core_received_time,
                    time,
                ),
            )
            assert row is not None
            return NodeColdtagEventAlertLiquidSchema(**row)

        schema = await self._commit(__query)

        cache_keys = [f"node_coldtag_event_alert_liquids_by_node_id:{node_id}"]
        await self._redis.delete(*cache_keys)

        return await PersistedNodeColdtagEventAlertLiquid.construct_model(self._app, schema)

    async def create_node_event_alert_impact(
        self,
        node_id: str,
        /,
        *,
        core_id: str,
        core_received_time: datetime,
        time: datetime,
    ) -> PersistedNodeColdtagEventAlertImpact:
        async def __query(client: PgConnection) -> NodeColdtagEventAlertImpactSchema:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    INSERT INTO node_coldtag_event_alert_impact (
                        node_coldtag_id,
                        core_coldtag_id,
                        core_coldtag_received_time,
                        event_time
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    ) RETURNING *
                    """,
                    int(node_id),
                    int(core_id),
                    core_received_time,
                    time,
                ),
            )
            assert row is not None
            return NodeColdtagEventAlertImpactSchema(**row)

        schema = await self._commit(__query)

        cache_keys = [f"node_coldtag_event_alert_impacts_by_node_id:{node_id}"]
        await self._redis.delete(*cache_keys)

        return await PersistedNodeColdtagEventAlertImpact.construct_model(self._app, schema)
