from datetime import datetime

import strawberry

from src.persistence.user import PersistedUser


@strawberry.type
class User:
    id: strawberry.scalars.ID
    time: datetime


async def resolve_user(user: PersistedUser, /) -> User:
    return User(
        id=strawberry.scalars.ID(str(user.id)),
        time=user.time,
    )
