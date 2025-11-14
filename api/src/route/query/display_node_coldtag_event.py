import asyncio
from datetime import datetime
from typing import TYPE_CHECKING

import strawberry
from strawberry import Info

from src.route.resolve.node_coldtag import (
    NodeColdtagEvent,
    NodeColdtagEventAlertImpact,
    NodeColdtagEventAlertLiquid,
    resolve_node_coldtag_event,
    resolve_node_coldtag_event_alert_impact,
    resolve_node_coldtag_event_alert_liquid,
)

if TYPE_CHECKING:
    from src.route import AppContext


@strawberry.type
class NodeColdtagEventDisplay:
    @strawberry.type
    class DisplayNodeColdtagEventFields:
        @strawberry.field
        async def all_by_time_range(
            self, a: datetime, info: Info["AppContext"], b: datetime | None = None
        ) -> list[NodeColdtagEvent]:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_events = await node_coldtag_persistence.find_node_events_all_by_time_range(a, b)
            return await asyncio.gather(*[resolve_node_coldtag_event(event, info=info) for event in persisted_events])

    @strawberry.field
    async def display_node_coldtag_event(self) -> DisplayNodeColdtagEventFields:
        return NodeColdtagEventDisplay.DisplayNodeColdtagEventFields()


@strawberry.type
class NodeColdtagEventAlertLiquidDisplay:
    @strawberry.type
    class DisplayNodeColdtagEventAlertLiquidFields:
        @strawberry.field
        async def all_by_time_range(
            self, a: datetime, info: Info["AppContext"], b: datetime | None = None
        ) -> list[NodeColdtagEventAlertLiquid]:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_events = await node_coldtag_persistence.find_node_event_alert_liquids_all_by_time_range(a, b)
            return await asyncio.gather(
                *[resolve_node_coldtag_event_alert_liquid(event, info=info) for event in persisted_events]
            )

    @strawberry.field
    async def display_node_coldtag_event_alert_liquid(self) -> DisplayNodeColdtagEventAlertLiquidFields:
        return NodeColdtagEventAlertLiquidDisplay.DisplayNodeColdtagEventAlertLiquidFields()


@strawberry.type
class NodeColdtagEventAlertImpactDisplay:
    @strawberry.type
    class DisplayNodeColdtagEventAlertImpactFields:
        @strawberry.field
        async def all_by_time_range(
            self, a: datetime, info: Info["AppContext"], b: datetime | None = None
        ) -> list[NodeColdtagEventAlertImpact]:
            node_coldtag_persistence = info.context.node_coldtag_persistence
            persisted_events = await node_coldtag_persistence.find_node_event_alert_impacts_all_by_time_range(a, b)
            return await asyncio.gather(
                *[resolve_node_coldtag_event_alert_impact(event, info=info) for event in persisted_events]
            )

    @strawberry.field
    async def display_node_coldtag_event_alert_impact(self) -> DisplayNodeColdtagEventAlertImpactFields:
        return NodeColdtagEventAlertImpactDisplay.DisplayNodeColdtagEventAlertImpactFields()
