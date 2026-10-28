import { useCallback, useEffect, useState } from "react";

import "./App.css";

// Import the dashboard components.
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import SummaryCards from "./components/SummaryCards";

// Import functions that communicate with the Django API.
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary,
} from "./services/expenseService";

// Default values for the expense form.
const emptyForm = {
  description: "",
  category: "",
  amount: "",
  expense_date: new Date().toLocaleDateString("en-CA"),
};

function App() {
  // Store the expenses retrieved from Django.
  const [expenses, setExpenses] = useState([]);

  // Track whether the initial expense request is loading.
  const [loading, setLoading] = useState(true);

  // Store the text entered in the expense search box.
  const [search, setSearch] = useState("");

  // Store the category selected by the user.
  const [category, setCategory] = useState("");

  // Store the selected date range.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Track the expense currently being deleted.
  const [deletingId, setDeletingId] = useState(null);

  // Store general loading and deletion errors.
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Control the visibility of the add-expense form.
  const [showForm, setShowForm] = useState(false);

  // Store the current form values.
  const [form, setForm] = useState(emptyForm);

  // Track form submission status and messages.
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // Store the summary statistics retrieved from Django.
  const [summary, setSummary] = useState(null);

  // Retrieve the expense list from the service.
  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses({
        search,
        category,
        start_date: startDate,
        end_date: endDate,
      });

      setExpenses(data);
      setError("");
    } catch (err) {
      setError(
        "Could not load expenses. Check that Django is running."
      );

      console.error("Error loading expenses:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, startDate, endDate]);

  const fetchSummary = useCallback(async () => {
    try {
      // Request summary statistics using the active filters.
      const data = await getExpenseSummary({
        search,
        category,
        start_date: startDate,
        end_date: endDate,
      });

      // Update the summary cards with the filtered statistics.
      setSummary(data);
    } catch (err) {
      console.error("Error loading expense summary:", err);
    }
  }, [search, category, startDate, endDate]);

  // Load expenses and summary statistics when the app opens.
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Update a form field whenever the user changes its value.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  // Validate and submit a new expense.
  async function handleSubmit(event) {
    event.preventDefault();

    setFormError("");
    setSuccess("");

    // Ensure all required fields have values.
    if (
      !form.description.trim() ||
      !form.category ||
      !form.expense_date ||
      !form.amount
    ) {
      setFormError("Please complete all fields.");
      return;
    }

    // Ensure the amount is a positive number.
    if (
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);

    try {
      // Send the new expense to Django.
      await createExpense({
        description: form.description.trim(),
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date,
      });

      // Reset and close the form after saving.
      setForm(emptyForm);
      setShowForm(false);
      setSuccess("Expense added successfully.");

      // Refresh the expense list and summary.
      await Promise.all([
        fetchExpenses(),
        fetchSummary(),
      ]);
    } catch (err) {
      setFormError(
        err.message || "Could not save the expense."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete an expense after user confirmation.
  async function handleDelete(expense) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}"?`
    );

    if (!confirmed) return;

    setDeletingId(expense.id);
    setDeleteError("");
    setSuccess("");

    try {
      // Ask the service to delete the expense in Django.
      await deleteExpense(expense.id);

      // Immediately remove the deleted item from the screen.
      setExpenses((current) =>
        current.filter((item) => item.id !== expense.id)
      );

      setSuccess(
        `"${expense.description}" was deleted successfully.`
      );

      // Refresh the summary after deletion.
      await fetchSummary();
    } catch (err) {
      setDeleteError(
        err.message ||
          "Could not delete the expense. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="app">
      {/* Dashboard heading and add-expense button. */}
      <header className="app-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>

          <h1>Expense Tracker</h1>

          <p className="subtitle">
            Track your spending and understand your money.
          </p>
        </div>

        <button
          className="add-button"
          type="button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setFormError("");
            setSuccess("");
          }}
        >
          {showForm ? "Cancel" : "+ Add expense"}
        </button>
      </header>

      {/* Display successful-operation messages. */}
      {success && (
        <p className="success-message" role="status">
          {success}
        </p>
      )}

      {/* Display deletion errors. */}
      {deleteError && (
        <p className="error-message" role="alert">
          {deleteError}
        </p>
      )}

      {/* Show the expense form when requested. */}
      {showForm && (
        <ExpenseForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          saving={saving}
          error={formError}
        />
      )}
      

      <div className="expense-filters">
        <div className="search-bar">
          <label htmlFor="expense-search">Search expenses</label>
          <input
            id="expense-search"
            type="search"
            placeholder="Search by description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="category-filter">
          <label htmlFor="expense-category">Filter by category</label>
          <select
            id="expense-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>

            {[...new Set(expenses.map((expense) => expense.category))]
              .filter(Boolean)
              .sort()
              .map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
          </select>
        </div>
        
        <div className="date-filter">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="date-filter">
          <label htmlFor="end-date">To</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>


      {/* Display expenses and summary cards. */}
      {loading ? (
        <p>Loading expenses...</p>
      ) : error ? (
        <p className="error-message" role="alert">
          {error}
        </p>
      ) : (
        <>
          <SummaryCards summary={summary} />

          <ExpenseTable
            expenses={expenses}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </>
      )}

      {/* Footer. */}
      <footer className="app-footer">
        Expense Tracker · Built with React and Django
      </footer>
    </main>
  );
}

export default App;
