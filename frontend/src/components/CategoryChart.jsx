
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Colours used to distinguish expense categories.
const CATEGORY_COLORS = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
];

// Display spending totals as Ugandan shillings.
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function CategoryChart({ summary }) {
  // Read category totals from the Django summary response.
  const categoryData = summary?.by_category ?? [];

  // Get the total for the currently selected filters.
  const totalSpending = Number(summary?.total_amount ?? 0);

  // Show a helpful message when there are no expenses to chart.
  if (categoryData.length === 0) {
    return (
      <section className="chart-card">
        <h2>Spending by category</h2>
        <p>
          No category spending data available for the selected filters.
        </p>
      </section>
    );
  }

  return (
    <section className="chart-card">
      <div className="chart-heading">
        <div>
          <h2>Spending by category</h2>
          <p>How your expenses are distributed</p>
        </div>
      </div>

      <div className="category-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
            data={categoryData}
            dataKey="total_amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="78%"
            paddingAngle={3}
            label={({ percent }) => `${Math.round(percent * 100)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={
                    CATEGORY_COLORS[
                      index % CATEGORY_COLORS.length
                    ]
                  }
                />
              ))}
            </Pie>

            {/* Display the total in the centre of the doughnut. */}
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#6b7280"
              fontSize={12}
            >
              Total spending
            </text>

            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#111827"
              fontSize={17}
              fontWeight={700}
            >
              {formatCurrency(totalSpending)}
            </text>

            <Tooltip
              formatter={(value) => formatCurrency(value)}
            />

            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="spending-breakdown">
        <h3>Spending breakdown</h3>

        {categoryData.map((item, index) => {
          const percentage =
            totalSpending > 0
              ? (Number(item.total_amount) / totalSpending) * 100
              : 0;

          return (
            <div className="breakdown-item" key={item.category}>
              <div className="breakdown-details">
                <div className="breakdown-category">
                  <span
                    className="breakdown-dot"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[
                          index % CATEGORY_COLORS.length
                        ],
                    }}
                  />
                  <span>{item.category}</span>
                </div>

                <strong>{formatCurrency(item.total_amount)}</strong>
              </div>

              <div className="breakdown-progress-row">
                <div className="breakdown-progress-track">
                  <div
                    className="breakdown-progress-fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor:
                        CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                    }}
                  />
                </div>

                <span className="breakdown-percentage">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}

export default CategoryChart;
