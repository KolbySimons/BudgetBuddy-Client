import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "../../styles/Card.css";

const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
          <p className="card-subtitle">Latest financial activity</p>
        </div>
        <div className="card-body">
          <p
            style={{
              color: "var(--gray-600)",
              textAlign: "center",
              padding: "2rem",
            }}
          >
            No transactions yet. Start tracking your expenses!
          </p>
          <Link to="/transactions" className="btn btn-primary btn-full">
            Add Transaction
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Transactions</h3>
        <p className="card-subtitle">
          Last {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem",
                background: "var(--gray-50)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--gray-200)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>
                  {transaction.category?.icon || "📝"}
                </span>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--gray-800)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {transaction.description}
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                    {transaction.category?.name} •{" "}
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
              </div>

              <span
                style={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  color:
                    transaction.type === 0 ? "var(--danger)" : "var(--success)",
                }}
              >
                {transaction.type === 0 ? "-" : "+"}
                {formatCurrency(transaction.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <Link to="/transactions" className="btn btn-secondary btn-full">
          View All Transactions
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactions;
