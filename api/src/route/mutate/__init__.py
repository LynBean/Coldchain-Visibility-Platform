from strawberry.tools import merge_types

from .create_core_coldtag import CoreColdtagCreate
from .create_node_coldtag import NodeColdtagCreate
from .create_route_cycle import RouteCycleCreate
from .delete_core_coldtag import CoreColdtagDelete
from .delete_node_coldtag import NodeColdtagDelete
from .update_core_coldtag import CoreColdtagUpdate
from .update_node_coldtag import NodeColdtagUpdate
from .update_route_cycle import RouteCycleUpdate

MutationSchema = merge_types(
    name="MutationSchema",
    types=(
        CoreColdtagCreate,
        CoreColdtagDelete,
        CoreColdtagUpdate,
        NodeColdtagCreate,
        NodeColdtagDelete,
        NodeColdtagUpdate,
        RouteCycleCreate,
        RouteCycleUpdate,
    ),
)
