
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Format amounts as Ugandan shillings.
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

// Convert YYYY-MM into a readable month label.
function formatMonth(month) {
  const [year, monthNumber] = month.split("-");

  return new Date(
    Number(year),
    Number(monthNumber) - 1
  ).toLocaleDateString("en-UG", {
    month: "short",
    year: "numeric",
  });
}

function MonthlySpendingChart({ monthlySummary }) {
  const chartData = monthlySummary.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  }));

  return (
    <section className="chart-card">
      <div className="chart-heading">
        <h2>Monthly spending</h2>
        <p>Compare your spending over time</p>
      </div>

      {chartData.length === 0 ? (
        <p>No monthly spending data available for the selected filters.</p>
      ) : (
        <div className="category-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 16,
                left: 16,
                bottom: 8,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 12 }}
              />

              <YAxis
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-UG", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                labelFormatter={(label) => `Month: ${label}`}
                formatter={(value) => formatCurrency(value)}
              />

              <Bar
                dataKey="total_amount"
                name="Total spending"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default MonthlySpendingChart;
