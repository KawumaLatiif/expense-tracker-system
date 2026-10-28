
import React from "react";

// Format amounts as Ugandan shillings.
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Display expenses in a table, with an action to delete each expense.
function ExpenseTable({ expenses, onDelete, deletingId }) {
  return (
    <section className="transactions">
      <div className="section-heading">
        <div>
          <h2>Recent expenses</h2>
          <p>Your latest transactions</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th className="amount-column">Amount</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                {/* Expense description */}
                <td className="description-cell">
                  {expense.description}
                </td>

                {/* Category badge */}
                <td>
                  <span className="category-badge">
                    {expense.category}
                  </span>
                </td>

                {/* Date of the expense */}
                <td>{expense.expense_date}</td>

                {/* Amount aligned under the Amount heading */}
                <td className="amount-column">
                  {formatCurrency(expense.amount)}
                </td>

                {/* Delete button for this particular expense */}
                <td className="actions-column">
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => onDelete(expense)}
                    disabled={deletingId === expense.id}
                  >
                    {deletingId === expense.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}

            {/* Display a helpful message when there are no expenses. */}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ExpenseTable;
