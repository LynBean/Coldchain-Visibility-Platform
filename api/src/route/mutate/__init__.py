from strawberry.tools import merge_types

from .create_core_coldtag import CoreColdtagCreate
from .delete_core_coldtag import CoreColdtagDelete
from .update_core_coldtag import CoreColdtagUpdate

MutationSchema = merge_types(
    name="MutationSchema",
    types=(
        CoreColdtagCreate,
        CoreColdtagDelete,
        CoreColdtagUpdate,
    ),
)
