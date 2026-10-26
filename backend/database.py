import sqlite3

from backend.config import DATABASE_PATH


def get_connection():
    """Create and return a connection to the project database."""
    return sqlite3.connect(DATABASE_PATH)