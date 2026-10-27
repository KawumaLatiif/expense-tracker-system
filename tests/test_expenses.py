
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend.expenses import (
    add_expense,
    list_expenses,
    get_expense,
    update_expense,
    delete_expense,
    get_expense_summary,
)


class ExpenseDatabaseTests(unittest.TestCase):
    def setUp(self):
        """Create a fresh temporary database for each test."""
        temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(temporary_directory.cleanup)

        self.database_path = (
            Path(temporary_directory.name) / "test_expenses.db"
        )

        # Redirect database connections to the temporary database.
        database_patcher = patch(
            "backend.database.DATABASE_PATH",
            self.database_path,
        )
        database_patcher.start()
        self.addCleanup(database_patcher.stop)

        # Create the schema in the temporary database.
        project_root = Path(__file__).resolve().parents[1]
        schema_path = project_root / "backend" / "schema.sql"
        schema = schema_path.read_text(encoding="utf-8")

        connection = sqlite3.connect(self.database_path)
        try:
            connection.executescript(schema)
        finally:
            connection.close()

    def test_add_and_retrieve_expense(self):
        expense_id = add_expense("Lunch", "Food", 5000)

        expense = get_expense(expense_id)

        self.assertIsNotNone(expense)
        self.assertEqual(expense["description"], "Lunch")
        self.assertEqual(expense["category"], "Food")
        self.assertEqual(expense["amount"], 5000)

    def test_filter_expenses_by_category(self):
        add_expense("Lunch", "Food", 5000)
        add_expense("Taxi", "Transport", 8000)
        add_expense("Dinner", "Food", 7000)

        food_expenses = list_expenses("food")

        self.assertEqual(len(food_expenses), 2)
        self.assertTrue(
            all(item["category"] == "Food" for item in food_expenses)
        )

    def test_update_expense(self):
        expense_id = add_expense("Lunch", "Food", 5000)

        updated = update_expense(
            expense_id, "Dinner", "Food", 9000
        )

        expense = get_expense(expense_id)

        self.assertTrue(updated)
        self.assertEqual(expense["description"], "Dinner")
        self.assertEqual(expense["amount"], 9000)

    def test_delete_expense(self):
        expense_id = add_expense("Taxi", "Transport", 8000)

        deleted = delete_expense(expense_id)

        self.assertTrue(deleted)
        self.assertIsNone(get_expense(expense_id))

    def test_invalid_expense_is_rejected(self):
        with self.assertRaises(ValueError):
            add_expense("", "Food", 5000)

        with self.assertRaises(ValueError):
            add_expense("Lunch", "Food", 0)

        with self.assertRaises(ValueError):
            add_expense("Lunch", "Food", -100)

    def test_summary_calculations(self):
        add_expense("Lunch", "Food", 5000)
        add_expense("Dinner", "Food", 7000)
        add_expense("Taxi", "Transport", 8000)

        summary = get_expense_summary()

        self.assertEqual(summary["expense_count"], 3)
        self.assertEqual(summary["total"], 20000)
        self.assertAlmostEqual(summary["average"], 20000 / 3)

        food = next(
            item for item in summary["categories"]
            if item["category"] == "Food"
        )
        self.assertEqual(food["expense_count"], 2)
        self.assertEqual(food["total"], 12000)

    def test_missing_expense_returns_false_for_update_and_delete(self):
        self.assertFalse(
            update_expense(999, "Lunch", "Food", 5000)
        )
        self.assertFalse(delete_expense(999))


if __name__ == "__main__":
    unittest.main()
