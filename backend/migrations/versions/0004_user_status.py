"""User account status — active | suspended (admin-managed)

Revision ID: 0004_user_status
Revises: 0003_screening
Create Date: 2026-06-15
"""
from alembic import op
import sqlalchemy as sa

revision = "0004_user_status"
down_revision = "0003_screening"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column("status", sa.String(), nullable=False,
                  server_default="active"),
    )
    op.create_check_constraint(
        "users_status_check", "users",
        "status IN ('active','suspended')",
    )


def downgrade():
    op.drop_constraint("users_status_check", "users", type_="check")
    op.drop_column("users", "status")
