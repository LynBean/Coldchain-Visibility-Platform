from strawberry.tools import merge_types

from .create_user import UserCreate

# MutationSchema = merge_types(
#     name="MutationSchema",
#     types=(
#         UserCreate,
#     ),
# )

MutationSchema = UserCreate
