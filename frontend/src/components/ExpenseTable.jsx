
import React, { useEffect, useState } from "react";

// Number of expenses displayed on each page.
const ITEMS_PER_PAGE = 10;

// Format amounts as Ugandan shillings.
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Display expenses and provide edit and delete actions.
function ExpenseTable({
  expenses,
  onDelete,
  deletingId,
  onEdit,
  hasFilters = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date_newest");

  // Sort expenses according to the selected option.
  const sortedExpenses = [...expenses].sort((a, b) => {
    switch (sortBy) {
      case "date_oldest":
        return (
          new Date(a.expense_date) - new Date(b.expense_date) ||
          a.id - b.id
        );

      case "amount_highest":
        return Number(b.amount) - Number(a.amount);

      case "amount_lowest":
        return Number(a.amount) - Number(b.amount);

      case "description_az":
        return a.description.localeCompare(b.description);

      case "description_za":
        return b.description.localeCompare(a.description);

      case "date_newest":
      default:
        return (
          new Date(b.expense_date) - new Date(a.expense_date) ||
          b.id - a.id
        );
    }
  });

  // Calculate the total number of pages.
  const totalPages = Math.ceil(
    sortedExpenses.length / ITEMS_PER_PAGE
  );

  // Return to page one when the displayed results or sorting change.
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses, sortBy]);

  // Keep the current page valid if expenses are removed.
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Determine which expenses belong on this page.
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedExpenses = sortedExpenses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Navigate between pages.
  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(page - 1, 1));
  }

  function goToNextPage() {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages)
    );
  }

  const isEmpty = sortedExpenses.length === 0;

  return (
    <section className="transactions">
      <div className="section-heading">
        <div>
          <h2>Recent expenses</h2>
          <p>Your latest transactions</p>
        </div>
      </div>

      {!isEmpty && (
        <div className="sorting-controls">
          <label htmlFor="expense-sort">Sort by</label>
          <select
            id="expense-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date_newest">Date: Newest first</option>
            <option value="date_oldest">Date: Oldest first</option>
            <option value="amount_highest">
              Amount: Highest to lowest
            </option>
            <option value="amount_lowest">
              Amount: Lowest to highest
            </option>
            <option value="description_az">
              Description: A–Z
            </option>
            <option value="description_za">
              Description: Z–A
            </option>
          </select>
        </div>
      )}

      {isEmpty ? (
        <div className="empty-state">
          <h3>
            {hasFilters
              ? "No matching expenses"
              : "No expenses yet"}
          </h3>
          <p>
            {hasFilters
              ? "Try changing your search or clearing your filters to see more expenses."
              : "Your expenses will appear here once you add your first transaction."}
          </p>
        </div>
      ) : (
        <>
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
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="description-cell">
                      {expense.description}
                    </td>
                    <td>
                      <span className="category-badge">
                        {expense.category}
                      </span>
                    </td>
                    <td>{expense.expense_date}</td>
                    <td className="amount-column">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="actions-column">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => onEdit(expense)}
                        disabled={deletingId === expense.id}
                      >
                        Edit
                      </button>
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
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <p className="pagination-info">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                sortedExpenses.length
              )}{" "}
              of {sortedExpenses.length} expenses
            </p>

            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="pagination-page">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="pagination-button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ExpenseTable;
