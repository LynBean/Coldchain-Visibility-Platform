from collections.abc import Awaitable, Callable
from typing import TYPE_CHECKING, Any, Final, Literal, TypeVar

import asyncpg
from fastapi import FastAPI

if TYPE_CHECKING:
    from redis import Redis
    from supabase import AClient as SupabaseClient


class MissingType:
    def __repr__(self) -> Literal["_UNSET"]:
        return "_UNSET"


MISSING: Final[MissingType] = MissingType()

T = TypeVar("T")


class InsertConstructor:
    def __init__(self, initial: list[Any] | None = None, /) -> None:
        self._pairs: dict[str, Any] = {}
        self._values: list[Any] = initial if initial else []
        self._initial = len(self._values)

    def add(self, key: str, value: Any, /) -> None:  # noqa: ANN401
        self._pairs[key] = value
        self._values.append(value)

    def query(self, template: str, /) -> str:
        columns = ", ".join(self._pairs.keys())
        placeholders = ", ".join(f"${i}" for i in range(self._initial + 1, self._initial + len(self._pairs) + 1))

        return template.replace("$COLUMNS", columns).replace("$VALUES", placeholders)

    @property
    def values(self) -> tuple[Any]:
        return tuple(self._values)


class UpdateConstructor:
    def __init__(self, initial: list[Any] | None = None, /) -> None:
        self._pairs: dict[str, Any] = {}
        self._values: list[Any] = initial if initial else []
        self._initial = len(self._values)

    def add(self, key: str, value: Any, /) -> None:  # noqa: ANN401
        self._pairs[key] = value
        self._values.append(value)

    def query(self, template: str, /) -> str:
        set_clauses = [f"{key} = ${i}" for i, key in enumerate(self._pairs.keys(), start=self._initial + 1)]
        return template.replace("$SET_CLAUSES", ", ".join(set_clauses))

    @property
    def values(self) -> tuple[Any]:
        return tuple(self._values)


class BasePersistence:
    def __init__(self, app: FastAPI, /, pool: asyncpg.Pool) -> None:
        self._app = app
        self._pool = pool

        self._supabase: SupabaseClient = app.extra["supabase"]
        self._redis: Redis = app.extra["redis"]

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
