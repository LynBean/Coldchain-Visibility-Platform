from strawberry.tools import merge_types

from .display_user import UserDisplay

# QuerySchema = merge_types(
#     name="QuerySchema",
#     types=(
#         UserDisplay,
#     ),
# )

QuerySchema = UserDisplay
