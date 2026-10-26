
import sqlite3

from backend.config import DATABASE_PATH


def get_connection():
    """Create and return a database connection."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """Create the database tables and indexes if needed."""
    schema_path = DATABASE_PATH.parent / "backend" / "schema.sql"
    schema = schema_path.read_text(encoding="utf-8")

    with get_connection() as connection:
        connection.executescript(schema)


if __name__ == "__main__":
    initialize_database()
    print(f"Database initialized at: {DATABASE_PATH}")
