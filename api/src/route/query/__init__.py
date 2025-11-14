from strawberry.tools import merge_types

from .display_core_coldtag import CoreColdtagDisplay
from .display_core_coldtag_event import CoreColdtagEventDisplay
from .display_node_coldtag import NodeColdtagDisplay
from .display_node_coldtag_event import (
    NodeColdtagEventAlertImpactDisplay,
    NodeColdtagEventAlertLiquidDisplay,
    NodeColdtagEventDisplay,
)
from .display_route_cycle import RouteCycleDisplay

QuerySchema = merge_types(
    name="QuerySchema",
    types=(
        CoreColdtagDisplay,
        CoreColdtagEventDisplay,
        NodeColdtagDisplay,
        NodeColdtagEventAlertImpactDisplay,
        NodeColdtagEventAlertLiquidDisplay,
        NodeColdtagEventDisplay,
        RouteCycleDisplay,
    ),
)
