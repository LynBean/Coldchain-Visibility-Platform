import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Literal, cast

import asyncpg
import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL
from supabase import AsyncClientOptions
from supabase import create_async_client as create_supabase_client

from src.listener import create_mqtt_client
from src.persistence.core_coldtag import CoreColdtagPersistence
from src.persistence.node_coldtag import NodeColdtagPersistence
from src.persistence.route_cycle import RouteCyclePersistence

from .route import create_context, create_schema

ENV: Literal["development", "production"] = cast(
    "Literal['development', 'production']",
    os.getenv("ENV", "development"),
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    app.extra["supabase"] = await create_supabase_client(
        supabase_url=cast("str", os.getenv("SUPABASE_URL")),
        supabase_key=cast("str", os.getenv("SUPABASE_SECRET_KEY")),
        options=AsyncClientOptions(storage_client_timeout=8000),
    )
    app.extra["supabase_database_pool"] = await asyncpg.create_pool(
        os.getenv("SUPABASE_DB_URL"),
    )
    app.extra["redis"] = aioredis.from_url(
        os.getenv("REDIS_URL"),
        decode_responses=False,
    )

    supabase_database_pool: asyncpg.Pool = app.extra["supabase_database_pool"]

    app.extra["core_coldtag_persistence"] = CoreColdtagPersistence(app, supabase_database_pool)
    app.extra["node_coldtag_persistence"] = NodeColdtagPersistence(app, supabase_database_pool)
    app.extra["route_cycle_persistence"] = RouteCyclePersistence(app, supabase_database_pool)

    mqtt = await create_mqtt_client()
    app.extra["mqtt"] = mqtt.client
    await mqtt.connect()
    await mqtt.subscribe_core_event(app)
    await mqtt.subscribe_node_event(app)
    await mqtt.subscribe_node_event_alert_impact(app)
    await mqtt.subscribe_node_event_alert_liquid(app)

    yield

    await app.extra["redis"].aclose(close_connection_pool=True)
    await supabase_database_pool.close()
    await mqtt.disconnect()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    middleware_class=CORSMiddleware,
    allow_credentials=True,
    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
    allow_methods=[
        "*",
    ],
    allow_origins=[cast("str", os.getenv("WEB_URL"))] if ENV == "production" else "*",
)

app.include_router(
    router=GraphQLRouter(
        schema=create_schema(),
        context_getter=create_context(app, env=ENV),
        multipart_uploads_enabled=True,
        subscription_protocols=[GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL],
    ),
    prefix="/graphql",
)

app.add_api_route(path="/health", endpoint=lambda: {"status": "healthy"})
