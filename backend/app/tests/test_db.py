from sqlmodel import Session, text
from app.api.deps import get_db


def test_db_session_fixture(db_session):
    """Test that the db_session fixture works correctly."""
    assert isinstance(db_session, Session)

    # Test that we can execute a simple query
    result = db_session.execute(text("SELECT 1")).scalar_one()
    assert result == 1


def test_get_session(test_db_engine):
    """Test that get_db returns a valid session."""
    session_generator = get_db()
    session = next(session_generator)

    assert isinstance(session, Session)

    # We need to finish the generator to avoid resource warnings
    try:
        next(session_generator)
    except StopIteration:
        pass
