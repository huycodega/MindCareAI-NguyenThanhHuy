"""Gmail self-registration + conversation threads + per-user memory

Revision ID: 0002_gmail_threads_memory
Revises: 0001_initial
Create Date: 2026-06-14

Adds:
  * users.email_verified            — gate login until OTP confirmed
  * conversations                   — multi-turn chat threads ("tasktab")
  * sessions.conversation_id        — link each turn to its thread
  * user_memory                     — durable per-user facts the agent recalls
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision = "0002_gmail_threads_memory"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade():
    # ---- users.email_verified ----
    # Existing rows (seed user/clinician) are treated as already verified.
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean, nullable=False,
                  server_default=sa.true()),
    )
    # New self-registered accounts should default to UNverified at the app
    # layer; flip the column default to false going forward.
    op.alter_column("users", "email_verified", server_default=sa.false())

    # ---- conversations ----
    op.create_table(
        "conversations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"),
                  nullable=False),
        sa.Column("title", sa.String, nullable=False,
                  server_default="New conversation"),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("archived", sa.Boolean, nullable=False,
                  server_default=sa.false()),
    )
    op.create_index("idx_conversations_user", "conversations",
                    ["user_id", sa.text("updated_at DESC")])

    # ---- sessions.conversation_id ----
    op.add_column(
        "sessions",
        sa.Column("conversation_id", UUID(as_uuid=True),
                  sa.ForeignKey("conversations.id", ondelete="CASCADE")),
    )
    op.create_index("idx_sessions_conversation", "sessions",
                    ["conversation_id", sa.text("created_at ASC")])

    # ---- user_memory ----
    op.create_table(
        "user_memory",
        sa.Column("user_id", UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"),
                  primary_key=True),
        sa.Column("facts_enc", sa.LargeBinary),
        sa.Column("summary", sa.Text),
        sa.Column("turn_count", sa.Integer, nullable=False,
                  server_default="0"),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table("user_memory")
    op.drop_index("idx_sessions_conversation", table_name="sessions")
    op.drop_column("sessions", "conversation_id")
    op.drop_index("idx_conversations_user", table_name="conversations")
    op.drop_table("conversations")
    op.drop_column("users", "email_verified")
