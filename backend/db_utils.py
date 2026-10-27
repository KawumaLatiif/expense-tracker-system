
from contextlib import contextmanager

from backend.database import get_connection


@contextmanager
def database_transaction():
    """Manage a database transaction and always close its connection."""
    connection = get_connection()

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
