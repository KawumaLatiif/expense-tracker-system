
import React from "react";

// Display the form used to add or edit an expense.
// App.jsx supplies the form data and event handlers.
function ExpenseForm({
  form,
  onChange,
  onSubmit,
  saving,
  error,
  editingExpense,
  onCancel,
}) {
  // Determine whether the user is adding or editing an expense.
  const isEditing = Boolean(editingExpense);

  return (
    <section className="transactions expense-form-section">
      <h2>
        {isEditing ? "Edit expense" : "Add a new expense"}
      </h2>

      <p className="subtitle">
        {isEditing
          ? "Update the transaction details below."
          : "Enter the transaction details below."}
      </p>

      {/* Submit the form using the handler supplied by App.jsx. */}
      <form className="expense-form" onSubmit={onSubmit}>
        {/* Expense description */}
        <div className="form-field">
          <label htmlFor="description">Description</label>

          <input
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="e.g. Lunch"
            maxLength={255}
            required
          />
        </div>

        {/* Expense category */}
        <div className="form-field">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={onChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Utilities">Utilities</option>
            <option value="Black Tax">Black Tax</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Amount in Ugandan shillings */}
        <div className="form-field">
          <label htmlFor="amount">Amount (UGX)</label>

          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            value={form.amount}
            onChange={onChange}
            placeholder="e.g. 15000"
            required
          />
        </div>

        {/* Date the expense occurred */}
        <div className="form-field">
          <label htmlFor="expense_date">Expense date</label>

          <input
            id="expense_date"
            name="expense_date"
            type="date"
            value={form.expense_date}
            onChange={onChange}
            required
          />
        </div>

        {/* Display validation or API errors when present. */}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Submit or cancel the current operation. */}
        <div className="form-actions">
          <button
            className="add-button"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEditing
                ? "Update Expense"
                : "Add Expense"}
          </button>

          <button
            className="cancel-button"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default ExpenseForm;
