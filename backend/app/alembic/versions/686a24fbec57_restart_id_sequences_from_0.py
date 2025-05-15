"""restart_id_sequences_from_0

Revision ID: 686a24fbec57
Revises: 5099ba781ed1
Create Date: 2025-05-15 16:32:40.577313

"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "686a24fbec57"
down_revision = "5099ba781ed1"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER SEQUENCE zone_zone_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE zone_zone_id_seq RESTART WITH 0;")

    op.execute("ALTER SEQUENCE user_user_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE user_user_id_seq RESTART WITH 0;")

    op.execute("ALTER SEQUENCE earthquake_earthquake_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE earthquake_earthquake_id_seq RESTART WITH 0;")

    op.execute("ALTER SEQUENCE event_event_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE event_event_id_seq RESTART WITH 0;")

    op.execute("ALTER SEQUENCE alert_alert_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE alert_alert_id_seq RESTART WITH 0;")

    op.execute("ALTER SEQUENCE report_report_id_seq MINVALUE 0;")
    op.execute("ALTER SEQUENCE report_report_id_seq RESTART WITH 0;")


def downgrade():
    op.execute("ALTER SEQUENCE zone_zone_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE zone_zone_id_seq RESTART;")

    op.execute("ALTER SEQUENCE user_user_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE user_user_id_seq RESTART;")

    op.execute("ALTER SEQUENCE earthquake_earthquake_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE earthquake_earthquake_id_seq RESTART;")

    op.execute("ALTER SEQUENCE event_event_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE event_event_id_seq RESTART;")

    op.execute("ALTER SEQUENCE alert_alert_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE alert_alert_id_seq RESTART;")

    op.execute("ALTER SEQUENCE report_report_id_seq MINVALUE 1;")
    op.execute("ALTER SEQUENCE report_report_id_seq RESTART;")
