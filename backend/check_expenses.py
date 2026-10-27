
from backend.database import initialize_database
from backend.expenses import (
    add_expense,
    list_expenses,
    get_expense,
    update_expense,
    delete_expense,
    get_expense_summary,
)


def main():
    initialize_database()

    print("\n1. Adding an expense")
    expense_id = add_expense(
        description="Test purchase",
        category="Testing",
        amount=15000,
    )
    print(f"Created expense ID: {expense_id}")

    print("\n2. Retrieving the expense")
    expense = get_expense(expense_id)
    print(expense)

    print("\n3. Listing expenses")
    for item in list_expenses():
        print(item)

    print("\n4. Updating the expense")
    updated = update_expense(
        expense_id=expense_id,
        description="Updated test purchase",
        category="Testing",
        amount=20000,
    )
    print(f"Updated successfully: {updated}")
    print(get_expense(expense_id))

    print("\n5. Viewing the summary")
    print(get_expense_summary())

    print("\n6. Deleting the test expense")
    deleted = delete_expense(expense_id)
    print(f"Deleted successfully: {deleted}")
    print(f"Record after deletion: {get_expense(expense_id)}")


if __name__ == "__main__":
    main()
