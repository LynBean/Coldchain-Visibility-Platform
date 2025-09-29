from typing import TYPE_CHECKING

import strawberry
from fastapi import HTTPException, status
from strawberry.types import Info

from src.route.resolve.user import User, resolve_user

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class UserDisplay:
    @strawberry.type
    class DisplayUserFields:
        @strawberry.field
        async def by_access_token(self, info: Info["AppContext"]) -> User:
            persisted_user = await info.context.user
            if persisted_user is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid access token.")

            return await resolve_user(persisted_user)

    @strawberry.field
    async def display_user(self) -> DisplayUserFields:
        return UserDisplay.DisplayUserFields()
