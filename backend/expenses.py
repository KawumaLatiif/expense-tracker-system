
from datetime import date

from backend.db_utils import database_transaction


def add_expense(description, category, amount, expense_date=None):
    """Save an expense and return its new ID."""
    description = description.strip()
    category = category.strip()

    if not description:
        raise ValueError("Description cannot be empty.")

    if not category:
        raise ValueError("Category cannot be empty.")

    if isinstance(amount, bool) or not isinstance(amount, int) or amount <= 0:
        raise ValueError("Amount must be a positive whole number.")

    expense_date = expense_date or date.today().isoformat()

    with database_transaction() as connection:
        cursor = connection.execute(
            """
            INSERT INTO expenses
                (description, category, amount, expense_date)
            VALUES (?, ?, ?, ?)
            """,
            (description, category, amount, expense_date),
        )
        return cursor.lastrowid


def list_expenses(category=None):
    """Return expenses, optionally filtered by category."""
    query = """
        SELECT id, description, category, amount, expense_date, created_at
        FROM expenses
    """
    parameters = ()

    if category and category.strip():
        query += " WHERE LOWER(category) = LOWER(?)"
        parameters = (category.strip(),)

    query += " ORDER BY expense_date DESC, id DESC"

    with database_transaction() as connection:
        rows = connection.execute(query, parameters).fetchall()
        return [dict(row) for row in rows]


def get_expense(expense_id):
    """Return one expense by ID, or None if it does not exist."""
    with database_transaction() as connection:
        row = connection.execute(
            """
            SELECT id, description, category, amount, expense_date, created_at
            FROM expenses
            WHERE id = ?
            """,
            (expense_id,),
        ).fetchone()

        return dict(row) if row else None


def update_expense(expense_id, description, category, amount):
    """Update an existing expense and report whether it existed."""
    description = description.strip()
    category = category.strip()

    if not description:
        raise ValueError("Description cannot be empty.")

    if not category:
        raise ValueError("Category cannot be empty.")

    if isinstance(amount, bool) or not isinstance(amount, int) or amount <= 0:
        raise ValueError("Amount must be a positive whole number.")

    with database_transaction() as connection:
        cursor = connection.execute(
            """
            UPDATE expenses
            SET description = ?, category = ?, amount = ?
            WHERE id = ?
            """,
            (description, category, amount, expense_id),
        )
        return cursor.rowcount > 0


def delete_expense(expense_id):
    """Delete an expense and report whether it existed."""
    with database_transaction() as connection:
        cursor = connection.execute(
            "DELETE FROM expenses WHERE id = ?",
            (expense_id,),
        )
        return cursor.rowcount > 0


def get_expense_summary():
    """Return total spending, record count, average, and category totals."""
    with database_transaction() as connection:
        overall = connection.execute(
            """
            SELECT
                COUNT(*) AS expense_count,
                COALESCE(SUM(amount), 0) AS total,
                COALESCE(AVG(amount), 0) AS average
            FROM expenses
            """
        ).fetchone()

        categories = connection.execute(
            """
            SELECT
                category,
                COUNT(*) AS expense_count,
                SUM(amount) AS total
            FROM expenses
            GROUP BY category
            ORDER BY total DESC
            """
        ).fetchall()

        return {
            "expense_count": overall["expense_count"],
            "total": overall["total"],
            "average": overall["average"],
            "categories": [dict(row) for row in categories],
        }
