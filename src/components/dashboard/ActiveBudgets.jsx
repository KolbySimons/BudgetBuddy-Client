import { Link } from "react-router-dom";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import "../../styles/Card.css";
import "../../styles/ProgressBar.css";

const ActiveBudgets = ({ budgets }) => {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Budgets</h3>
          <p className="card-subtitle">Your current budget plans</p>
        </div>
        <div className="card-body">
          <p
            style={{
              color: "var(--gray-600)",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            No active budgets yet. Create your first budget to get started!
          </p>
          <Link to="/budgets" className="btn btn-primary btn-full">
            Create Budget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Active Budgets</h3>
        <p className="card-subtitle">
          {budgets.length} active budget{budgets.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="card-body">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {budgets.slice(0, 3).map((budget) => (
            <div key={budget.id} className="budget-item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontWeight: 600,
                      color: "var(--gray-800)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {budget.name}
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
                    {formatCurrency(budget.totalSpent)} /{" "}
                    {formatCurrency(budget.totalAmount)}
                  </p>
                </div>
                <span className="badge badge-success">ACTIVE</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budget.percentageUsed, 100)}%`,
                    background:
                      budget.percentageUsed >= 100
                        ? "linear-gradient(90deg, #e53e3e 0%, #fc8181 100%)"
                        : budget.percentageUsed >= 80
                        ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)"
                        : "linear-gradient(90deg, #38a169 0%, #48bb78 100%)",
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray-600)",
                  marginTop: "0.5rem",
                }}
              >
                {formatPercentage(budget.percentageUsed)} used
              </p>
            </div>
          ))}
        </div>
      </div>
      {budgets.length > 3 && (
        <div className="card-footer">
          <Link to="/budgets" className="btn btn-secondary btn-full">
            View All Budgets
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActiveBudgets;
