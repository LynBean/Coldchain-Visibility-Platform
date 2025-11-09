import strawberry


@strawberry.type
class Coordinate:
    latitude: float
    longitude: float
