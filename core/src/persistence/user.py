from datetime import datetime
from typing import cast

from asyncpg import Connection
from pydantic import UUID4, BaseModel
from supabase_auth.types import User as SupabaseUser

from . import BasePersistence


class UserSchema(BaseModel):
    id: UUID4
    time: datetime


class PersistedUser(BaseModel):
    id: UUID4
    supabase_user: SupabaseUser
    time: datetime


class UserPersistence(BasePersistence):
    async def _construct_persisted_user(self, data: UserSchema) -> PersistedUser:
        assert data.id is not None
        assert data.time is not None

        supabase_user = await self._supabase.auth.admin.get_user_by_id(str(data.id))

        return PersistedUser(id=data.id, supabase_user=supabase_user.user, time=data.time)

    async def find_user_by_id(self, user_id: str, /) -> PersistedUser | None:
        async def _query(client: Connection) -> UserSchema | None:
            row = await client.fetchrow(
                """
                SELECT * FROM "user"
                WHERE id = $1
                LIMIT 1
                """,
                user_id,
            )
            if row is None:
                return None

            return UserSchema(**row)

        schema = await self._commit(_query)
        if schema is None:
            return None

        return await self._construct_persisted_user(schema)

    async def create_user_by_access_token(self, access_token: str, /) -> PersistedUser:
        supabase_user = await self._supabase.auth.get_user(access_token)

        assert supabase_user is not None

        return await self.create_user(supabase_user_id=supabase_user.user.id)

    async def create_user(
        self,
        *,
        supabase_user_id: str,
    ) -> PersistedUser:
        async def _query(client: Connection) -> str:
            return cast(
                "str",
                await client.fetchval(
                    """
                    INSERT INTO "create_user" (
                        id,
                    ) VALUES (
                        $1,
                    ) RETURNING id
                    """,
                    supabase_user_id,
                ),
            )

        persisted_user_id = await self._commit(_query)
        persisted_user = await self.find_user_by_id(persisted_user_id)

        assert persisted_user is not None
        return persisted_user
