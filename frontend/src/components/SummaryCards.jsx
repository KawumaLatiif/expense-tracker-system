
import React from "react";

// Display spending statistics calculated by Django.
function SummaryCards({ summary }) {
  // Show zero values until the summary data is available.
  const totalSpending = summary?.total_amount ?? 0;
  const expenseCount = summary?.expense_count ?? 0;

  // Count the categories returned by the Django API.
  const categoryCount = summary?.by_category?.length ?? 0;

  // Format amounts as Ugandan shillings.
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  return (
    <section className="summary-grid">
      <article className="summary-card">
        <p>Total spending</p>
        <h2>{formatCurrency(totalSpending)}</h2>
        <span>Across all recorded expenses</span>
      </article>

      <article className="summary-card">
        <p>Expenses recorded</p>
        <h2>{expenseCount}</h2>
        <span>Total transactions</span>
      </article>

      <article className="summary-card">
        <p>Categories</p>
        <h2>{categoryCount}</h2>
        <span>Different spending categories</span>
      </article>
    </section>
  );
}

export default SummaryCards;
