import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Literal, cast

import asyncpg
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from strawberry.subscriptions import GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL
from supabase import AsyncClientOptions
from supabase import create_async_client as create_supabase_client

from .persistence.user import UserPersistence
from .route import AppSchema, create_context

ENV: Literal["development", "production"] = cast(
    "Literal['development', 'production']",
    os.getenv("ENV", "development"),
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    app.extra["supabase"] = await create_supabase_client(
        supabase_url=cast("str", os.getenv("SUPABASE_URL")),
        supabase_key=cast("str", os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
        options=AsyncClientOptions(storage_client_timeout=8000),
    )
    app.extra["supabase_database_pool"] = await asyncpg.create_pool(
        os.getenv("SUPABASE_DB_URL"),
    )

    supabase_database_pool: asyncpg.Pool = app.extra["supabase_database_pool"]
    app.extra["user_persistence"] = UserPersistence(app, supabase_database_pool)

    yield

    await supabase_database_pool.close()


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
        schema=AppSchema,
        context_getter=create_context(app, env=ENV),
        multipart_uploads_enabled=True,
        subscription_protocols=[GRAPHQL_TRANSPORT_WS_PROTOCOL, GRAPHQL_WS_PROTOCOL],
    ),
    prefix="/graphql",
)

app.add_api_route(path="/health", endpoint=lambda: {"status": "healthy"})
