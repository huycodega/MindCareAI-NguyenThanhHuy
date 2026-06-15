"""Screening table — periodic PHQ-9 / GAD-7 check-ins

Revision ID: 0003_screening
Revises: 0002_gmail_threads_memory
Create Date: 2026-06-15
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "0003_screening"
down_revision = "0002_gmail_threads_memory"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "screenings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("phq9_score", sa.SmallInteger),
        sa.Column("phq9_answers", JSONB),
        sa.Column("gad7_score", sa.SmallInteger),
        sa.Column("gad7_answers", JSONB),
        sa.Column("mood_score", sa.SmallInteger),
        sa.Column("phq9_level", sa.String),
        sa.Column("gad7_level", sa.String),
        sa.Column("notes", sa.Text),
    )
    op.create_index(
        "idx_screenings_user", "screenings",
        ["user_id", sa.text("created_at DESC")],
    )


def downgrade():
    op.drop_index("idx_screenings_user", table_name="screenings")
    op.drop_table("screenings")
