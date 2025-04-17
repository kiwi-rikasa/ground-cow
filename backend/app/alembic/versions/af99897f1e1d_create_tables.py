"""create tables

Revision ID: af99897f1e1d
Revises:
Create Date: 2025-04-17 17:59:20.241984

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "af99897f1e1d"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
