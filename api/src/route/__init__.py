from collections.abc import Callable
from functools import cached_property
from typing import Literal

from aiomqtt import Client as MQTTClient
from fastapi import FastAPI, UploadFile
from redis.asyncio import Redis
from strawberry import Schema
from strawberry.fastapi import BaseContext
from strawberry.file_uploads import Upload
from strawberry.schema.base import BaseSchema
from supabase import AClient as SupabaseClient

from src.persistence.core_coldtag import CoreColdtagPersistence
from src.persistence.node_coldtag import NodeColdtagPersistence
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
    def mqtt(self) -> MQTTClient:
        return self.app.extra["mqtt"]

    @cached_property
    def core_coldtag_persistence(self) -> CoreColdtagPersistence:
        return self.app.extra["core_coldtag_persistence"]

    @cached_property
    def node_coldtag_persistence(self) -> NodeColdtagPersistence:
        return self.app.extra["node_coldtag_persistence"]


def create_context(app: FastAPI, /, env: Literal["production", "development"]) -> Callable[..., AppContext]:
    context = AppContext(app, env=env)
    return lambda: context


def create_schema() -> BaseSchema:
    return Schema(
        query=QuerySchema,
        mutation=MutationSchema,
        scalar_overrides={UploadFile: Upload},
    )
