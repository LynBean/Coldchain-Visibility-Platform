from collections.abc import Callable
from functools import cached_property
from typing import Literal

from fastapi import FastAPI, UploadFile
from redis.asyncio import Redis
from strawberry import Schema
from strawberry.fastapi import BaseContext
from strawberry.file_uploads import Upload
from supabase import AClient as SupabaseClient

from src.persistence.coldtag import ColdtagPersistence
from src.route.mutate import MutationSchema
from src.route.query import QuerySchema


class AppContext(BaseContext):
    def __init__(self, app: FastAPI, /, env: Literal["production", "development"]) -> None:
        super().__init__()
        self.app = app
        self.env = env

    @property
    def authorization(self) -> str | None:
        if self.request:
            return self.request.headers.get("Authorization")

        if self.connection_params:
            return self.connection_params.get("Authorization")

        return None

    @cached_property
    def supabase(self) -> SupabaseClient:
        return self.app.extra["supabase"]

    @cached_property
    def redis(self) -> Redis:
        return self.app.extra["redis"]

    @cached_property
    def coldtag_persistence(self) -> ColdtagPersistence:
        return self.app.extra["coldtag_persistence"]


def create_context(app: FastAPI, /, env: Literal["production", "development"]) -> Callable[..., AppContext]:
    context = AppContext(app, env=env)
    return lambda: context


AppSchema = Schema(
    query=QuerySchema,
    mutation=MutationSchema,
    scalar_overrides={UploadFile: Upload},
)
