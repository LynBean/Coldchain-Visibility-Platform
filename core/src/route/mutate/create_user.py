from typing import TYPE_CHECKING

import strawberry
from fastapi import HTTPException, status
from strawberry.types import Info

from src.route.resolve.user import User, resolve_user

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class UserCreate:
    @strawberry.type
    class CreateUserFields:
        @strawberry.field
        async def by_access_token(self, info: Info["AppContext"]) -> User:
            authorization = info.context.authorization
            user_persistence = info.context.user_persistence

            if authorization is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid access token.")

            persisted_user = await user_persistence.create_user_by_access_token(authorization)
            return await resolve_user(persisted_user)

    @strawberry.field
    async def create_user(self) -> CreateUserFields:
        return UserCreate.CreateUserFields()
