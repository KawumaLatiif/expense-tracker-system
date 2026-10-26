from pathlib import Path

# Locate the root directory of the project.
BASE_DIR = Path(__file__).resolve().parent.parent

# Store the development database in the project root.
DATABASE_PATH = BASE_DIR / "expenses.db"