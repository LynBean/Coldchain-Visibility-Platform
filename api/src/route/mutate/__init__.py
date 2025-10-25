from strawberry.tools import merge_types

from .create_core_coldtag import CoreColdtagCreate
from .create_node_coldtag import NodeColdtagCreate
from .delete_core_coldtag import CoreColdtagDelete
from .delete_node_coldtag import NodeColdtagDelete
from .update_core_coldtag import CoreColdtagUpdate
from .update_node_coldtag import NodeColdtagUpdate

MutationSchema = merge_types(
    name="MutationSchema",
    types=(
        CoreColdtagCreate,
        CoreColdtagDelete,
        CoreColdtagUpdate,
        NodeColdtagCreate,
        NodeColdtagDelete,
        NodeColdtagUpdate,
    ),
)
