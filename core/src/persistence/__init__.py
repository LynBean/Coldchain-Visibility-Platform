from collections.abc import Awaitable, Callable
from typing import TYPE_CHECKING, Final, Literal, TypeVar

import asyncpg
from fastapi import FastAPI

if TYPE_CHECKING:
    from supabase import AClient as SupabaseClient


class _UnsetType:
    def __repr__(self) -> Literal["_UNSET"]:
        return "_UNSET"


_UNSET: Final[_UnsetType] = _UnsetType()

T = TypeVar("T")


class BasePersistence:
    def __init__(self, app: FastAPI, /, pool: asyncpg.Pool) -> None:
        self._app = app
        self._pool = pool

        self._supabase: SupabaseClient = app.extra["supabase"]

    async def _commit(self, command: Callable[[asyncpg.Connection], Awaitable[T]], /) -> T:
        async with self._pool.acquire() as client:
            try:
                await client.execute("BEGIN")
                result = await command(client)
                await client.execute("COMMIT")

            except asyncpg.exceptions.PostgresError:
                await client.execute("ROLLBACK")
                raise

            else:
                return result
