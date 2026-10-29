
import { useCallback, useEffect, useState } from "react";

import "./App.css";

// Import the dashboard components.
import ExpenseForm from "./components/ExpenseForm";
import ExpenseTable from "./components/ExpenseTable";
import SummaryCards from "./components/SummaryCards";
import CategoryChart from "./components/CategoryChart";
import MonthlySpendingChart from "./components/MonthlySpendingChart";

// Import functions that communicate with the Django API.
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getMonthlySummary,
} from "./services/expenseService";

// Default values for the expense form.
const emptyForm = {
  description: "",
  category: "",
  amount: "",
  expense_date: new Date().toLocaleDateString("en-CA"),
};

// Export expenses to a downloadable CSV file.
function exportExpensesToCSV(expenses) {
  if (!expenses.length) {
    return false;
  }

  const headers = [
    "Description",
    "Category",
    "Amount (UGX)",
    "Expense Date",
    "Created At",
  ];

  // Escape CSV values, including commas and quotation marks.
  function escapeCSV(value) {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  }

  // Create one CSV row for every matching expense.
  const rows = expenses.map((expense) => [
    expense.description,
    expense.category,
    expense.amount,
    expense.expense_date,
    expense.created_at,
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\r\n");

  // Add a UTF-8 BOM for better compatibility with Excel.
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Use the current local date in the filename.
  const today = [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0"),
  ].join("-");

  link.href = url;
  link.download = `expenses_${today}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  return true;
}

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

  // Control the visibility of the expense form.
  const [showForm, setShowForm] = useState(false);

  // Store the expense currently being edited, if any.
  const [editingExpense, setEditingExpense] = useState(null);

  // Store the current form values.
  const [form, setForm] = useState(emptyForm);

  // Track form submission status and messages.
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  // Store the summary statistics retrieved from Django.
  const [summary, setSummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);

  // Retrieve expenses using the active filters.
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

  // Retrieve summary statistics using the active filters.
  const fetchSummary = useCallback(async () => {
    try {
      const data = await getExpenseSummary({
        search,
        category,
        start_date: startDate,
        end_date: endDate,
      });

      setSummary(data);
    } catch (err) {
      console.error("Error loading expense summary:", err);
    }
  }, [search, category, startDate, endDate]);

  // Retrieve monthly spending using the active filters.
  const fetchMonthlySummary = useCallback(async () => {
    try {
      const data = await getMonthlySummary({
        search,
        category,
        start_date: startDate,
        end_date: endDate,
      });

      setMonthlySummary(data.by_month ?? []);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
      setMonthlySummary([]);
    }
  }, [search, category, startDate, endDate]);

  // Load dashboard data when the app opens or filters change.
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  // Update a form field whenever the user changes its value.
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  // Open the form with the selected expense's existing values.
  function handleEdit(expense) {
    setEditingExpense(expense);

    setForm({
      description: expense.description,
      category: expense.category,
      amount: String(expense.amount),
      expense_date: expense.expense_date,
    });

    setFormError("");
    setDeleteError("");
    setSuccess("");
    setShowForm(true);
  }

  // Close the form and reset its values and editing state.
  function handleCancelForm() {
    setShowForm(false);
    setEditingExpense(null);
    setForm(emptyForm);
    setFormError("");
  }

  // Validate and submit a new or updated expense.
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

    // Prepare the data sent to Django.
    const expenseData = {
      description: form.description.trim(),
      category: form.category,
      amount: Number(form.amount),
      expense_date: form.expense_date,
    };

    setSaving(true);

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
        setSuccess("Expense updated successfully.");
      } else {
        await createExpense(expenseData);
        setSuccess("Expense added successfully.");
      }

      // Reset the form and exit editing mode.
      setForm(emptyForm);
      setEditingExpense(null);
      setShowForm(false);

      // Refresh all dashboard data.
      await Promise.all([
        fetchExpenses(),
        fetchSummary(),
        fetchMonthlySummary(),
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
      await deleteExpense(expense.id);

      // Immediately remove the deleted item from the screen.
      setExpenses((current) =>
        current.filter((item) => item.id !== expense.id)
      );

      setSuccess(
        `"${expense.description}" was deleted successfully.`
      );

      // Refresh the summary and monthly chart after deletion.
      await Promise.all([
        fetchSummary(),
        fetchMonthlySummary(),
      ]);
    } catch (err) {
      setDeleteError(
        err.message ||
          "Could not delete the expense. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Export every expense matching the active filters.
  function handleExportCSV() {
    if (expenses.length === 0) {
      setSuccess("");
      setDeleteError("");
      setError("There are no expenses to export.");
      return;
    }

    const exported = exportExpensesToCSV(expenses);

    if (exported) {
      setError("");
      setDeleteError("");
      setSuccess(
        `CSV export started for ${expenses.length} expense${
          expenses.length === 1 ? "" : "s"
        }.`
      );
    }
  }

  return (
    <main className="app">
      {/* Dashboard heading and main actions. */}
      <header className="app-header">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>

          <h1>Expense Tracker</h1>

          <p className="subtitle">
            Track your spending and understand your money.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="export-button"
            type="button"
            onClick={handleExportCSV}
            disabled={loading || expenses.length === 0}
          >
            Export CSV
          </button>

          <button
            className="add-button"
            type="button"
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                setEditingExpense(null);
                setForm(emptyForm);
                setFormError("");
                setDeleteError("");
                setSuccess("");
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "+ Add expense"}
          </button>
        </div>
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
          editingExpense={editingExpense}
          onCancel={handleCancelForm}
        />
      )}

      {/* Search, category, and date filters. */}
      <div className="expense-filters">
        <div className="search-bar">
          <label htmlFor="expense-search">
            Search expenses
          </label>

          <input
            id="expense-search"
            type="search"
            placeholder="Search by description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="category-filter">
          <label htmlFor="expense-category">
            Filter by category
          </label>

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

        <button
          type="button"
          className="clear-filters-button"
          onClick={() => {
            setSearch("");
            setCategory("");
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear filters
        </button>
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

          <CategoryChart summary={summary} />

          <MonthlySpendingChart
            monthlySummary={monthlySummary}
          />

          <ExpenseTable
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deletingId}
            hasFilters={Boolean(
              search.trim() ||
              category ||
              startDate ||
              endDate
            )}
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
