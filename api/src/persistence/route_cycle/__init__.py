import asyncio
import re
from typing import cast

from asyncpg import Connection as PgConnection
from asyncpg import Pool as PgPool
from asyncpg import Record as PgRecord
from fastapi import FastAPI, HTTPException, status

from src.persistence import MISSING, BasePersistence, InsertConstructor, MissingType

from .model import (
    PersistedRouteCycle,
)
from .schema import (
    RouteCycleSchema,
)

__all__ = [
    "PersistedRouteCycle",
    "RouteCycleSchema",
]


def _is_valid_mac_address(address: str, /) -> bool:
    return bool(re.fullmatch(r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$", address))


class RouteCyclePersistence(BasePersistence):
    def __init__(self, app: FastAPI, pool: PgPool) -> None:
        super().__init__(app, pool=pool)

    async def find_route_cycles(self) -> list[PersistedRouteCycle]:
        async def __query(client: PgConnection) -> list[RouteCycleSchema]:
            rows = await client.fetch(
                """
                    SELECT * FROM route_cycle
                    """
            )
            return [RouteCycleSchema(**row) for row in rows]

        schemas = await self._commit(__query)
        return cast(
            "list[PersistedRouteCycle]",
            await asyncio.gather(*[PersistedRouteCycle.construct_model(self._app, schema) for schema in schemas]),
        )

    async def find_route_cycle_by_id(self, route_cycle_id: str, /) -> PersistedRouteCycle | None:
        async def __query(client: PgConnection) -> RouteCycleSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM route_cycle
                    WHERE id = $1
                    """,
                    int(route_cycle_id),
                ),
            )
            if not row:
                return None

            return RouteCycleSchema(**row)

        schema = await self._commit(__query)
        if schema is None:
            return None

        return await PersistedRouteCycle.construct_model(self._app, schema)

    async def find_latest_route_cycle_by_node_id(self, node_id: str, /) -> PersistedRouteCycle | None:
        async def __query(client: PgConnection) -> RouteCycleSchema | None:
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT * FROM route_cycle
                    WHERE node_coldtag_id = $1
                    ORDER BY id DESC
                    LIMIT 1
                    """,
                    int(node_id),
                ),
            )
            if not row:
                return None

            return RouteCycleSchema(**row)

        schema = await self._commit(__query)
        if schema is None:
            return None

        return await PersistedRouteCycle.construct_model(self._app, schema)

    async def create_route_cycle(
        self,
        *,
        node_coldtag_id: str,
        identifier: str | None = None,
        description: str | None = None,
        owner_name: str | None = None,
        placed_at: str | None = None,
        departure_latitude: float | None = None,
        departure_longitude: float | None = None,
        destination_latitude: float | None = None,
        destination_longitude: float | None = None,
        temperature_alert_threshold: float | None = None,
        humidity_alert_threshold: float | None = None,
    ) -> PersistedRouteCycle:
        route_cycle = await self.find_latest_route_cycle_by_node_id(node_coldtag_id)
        if route_cycle is not None and not (route_cycle.canceled or route_cycle.completed):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Node device has been occupied.")

        async def __query(client: PgConnection) -> RouteCycleSchema:
            row_id = cast(
                "int",
                await client.fetchval(
                    """
                    INSERT INTO create_route_cycle (
                        node_coldtag_id,
                        identifier,
                        description,
                        owner_name,
                        placed_at,
                        departure_latitude,
                        departure_longitude,
                        destination_latitude,
                        destination_longitude,
                        temperature_alert_threshold,
                        humidity_alert_threshold
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7,
                        $8,
                        $9,
                        $10,
                        $11
                    ) RETURNING id
                    """,
                    int(node_coldtag_id),
                    identifier,
                    description,
                    owner_name,
                    placed_at,
                    departure_latitude,
                    departure_longitude,
                    destination_latitude,
                    destination_longitude,
                    temperature_alert_threshold,
                    humidity_alert_threshold,
                ),
            )
            row = cast(
                "PgRecord",
                await client.fetchrow(
                    """
                    SELECT *
                    FROM route_cycle
                    WHERE id = $1
                    """,
                    row_id,
                ),
            )
            assert row is not None
            return RouteCycleSchema(**row)

        schema = await self._commit(__query)
        return await PersistedRouteCycle.construct_model(self._app, schema)

    async def update_route_cycle(
        self,
        route_cycle_id: str,
        /,
        *,
        identifier: str | None | MissingType = MISSING,
        description: str | None | MissingType = MISSING,
        owner_name: str | None | MissingType = MISSING,
        placed_at: str | None | MissingType = MISSING,
        departure_latitude: float | None | MissingType = MISSING,
        departure_longitude: float | None | MissingType = MISSING,
        destination_latitude: float | None | MissingType = MISSING,
        destination_longitude: float | None | MissingType = MISSING,
        temperature_alert_threshold: float | None | MissingType = MISSING,
        humidity_alert_threshold: float | None | MissingType = MISSING,
        started: bool | None | MissingType = MISSING,
        completed: bool | None | MissingType = MISSING,
        canceled: bool | None | MissingType = MISSING,
    ) -> PersistedRouteCycle:
        assert (
            identifier is not MISSING
            or description is not MISSING
            or owner_name is not MISSING
            or placed_at is not MISSING
            or departure_latitude is not MISSING
            or departure_longitude is not MISSING
            or destination_latitude is not MISSING
            or destination_longitude is not MISSING
            or temperature_alert_threshold is not MISSING
            or humidity_alert_threshold is not MISSING
            or started is not MISSING
            or completed is not MISSING
            or canceled is not MISSING
        )

        persisted_route_cycle = await self.find_route_cycle_by_id(route_cycle_id)
        assert persisted_route_cycle is not None

        async def __query(client: PgConnection) -> None:
            sql = InsertConstructor([int(route_cycle_id)])

            if identifier is not MISSING:
                sql.add("identifier", identifier)
            if description is not MISSING:
                sql.add("description", description)
            if owner_name is not MISSING:
                sql.add("owner_name", owner_name)
            if placed_at is not MISSING:
                sql.add("placed_at", placed_at)
            if departure_latitude is not MISSING:
                sql.add("departure_latitude", departure_latitude)
            if departure_longitude is not MISSING:
                sql.add("departure_longitude", departure_longitude)
            if destination_latitude is not MISSING:
                sql.add("destination_latitude", destination_latitude)
            if destination_longitude is not MISSING:
                sql.add("destination_longitude", destination_longitude)
            if temperature_alert_threshold is not MISSING:
                sql.add("temperature_alert_threshold", temperature_alert_threshold)
            if humidity_alert_threshold is not MISSING:
                sql.add("humidity_alert_threshold", humidity_alert_threshold)
            if started is not MISSING:
                sql.add("started", started)
            if completed is not MISSING:
                sql.add("completed", completed)
            if canceled is not MISSING:
                sql.add("canceled", canceled)

            await client.execute(
                sql.query(
                    """
                    INSERT INTO update_route_cycle (
                        route_cycle_id,
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
        updated_route_cycle = await self.find_route_cycle_by_id(route_cycle_id)
        assert updated_route_cycle is not None
        return updated_route_cycle
