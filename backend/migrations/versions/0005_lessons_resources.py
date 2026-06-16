"""Learning content — lessons + support resources (admin-managed, public)

Revision ID: 0005_lessons_resources
Revises: 0004_user_status
Create Date: 2026-06-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0005_lessons_resources"
down_revision = "0004_user_status"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "lessons",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("category", sa.String()),
        sa.Column("level", sa.String(), nullable=False,
                  server_default="basic"),
        sa.Column("duration", sa.String()),
        sa.Column("content", sa.Text()),
        sa.Column("objectives", JSONB()),
        sa.Column("tags", JSONB()),
        sa.Column("status", sa.String(), nullable=False,
                  server_default="draft"),
        sa.Column("author", sa.String()),
        sa.Column("views", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.CheckConstraint("level IN ('basic','intermediate','advanced')",
                           name="lessons_level_check"),
        sa.CheckConstraint("status IN ('draft','published')",
                           name="lessons_status_check"),
    )
    op.create_index("idx_lessons_status", "lessons",
                    ["status", "created_at"])

    op.create_table(
        "resources",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("type", sa.String(), nullable=False,
                  server_default="Article"),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("category", sa.String()),
        sa.Column("duration", sa.String()),
        sa.Column("url", sa.String()),
        sa.Column("content", sa.Text()),
        sa.Column("status", sa.String(), nullable=False,
                  server_default="published"),
        sa.Column("urgent", sa.Boolean(), nullable=False,
                  server_default=sa.false()),
        sa.Column("owner", sa.String()),
        sa.Column("tags", JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.CheckConstraint(
            "type IN ('Audio','Article','Video','CBT Tool')",
            name="resources_type_check"),
        sa.CheckConstraint(
            "status IN ('published','urgent','update','draft')",
            name="resources_status_check"),
    )
    op.create_index("idx_resources_status", "resources",
                    ["status", "created_at"])
    op.create_index("idx_resources_type", "resources", ["type"])


def downgrade():
    op.drop_index("idx_resources_type", table_name="resources")
    op.drop_index("idx_resources_status", table_name="resources")
    op.drop_table("resources")
    op.drop_index("idx_lessons_status", table_name="lessons")
    op.drop_table("lessons")
