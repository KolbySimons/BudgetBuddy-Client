import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import budgetService from "../../services/budgetService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { BudgetPeriodLabels } from "../../utils/constants";
import ProgressBar from "../../components/common/ProgressBar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import "../../styles/BudgetsPage.css";
import "../../styles/Button.css";
import "../../styles/Badge.css";

const BudgetsPage = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      console.log("Fetching budgets from API...");
      const response = await budgetService.getAll();
      console.log("Budgets API response:", response);

      // Handle different response formats
      if (response && Array.isArray(response)) {
        // Direct array response
        setBudgets(response);
      } else if (response && response.success && response.data) {
        // Wrapped response with success flag
        setBudgets(response.data);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        setBudgets(response.data);
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      toast.error(error.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await budgetService.delete(id);
      if (response.success) {
        toast.success("Budget deleted successfully");
        fetchBudgets();
      } else {
        toast.error(response.message || "Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    if (filter === "active") return budget.isActive;
    if (filter === "inactive") return !budget.isActive;
    return true;
  });

  const calculatePercentage = (spent, total) => {
    if (total === 0) return 0;
    return Math.round((spent / total) * 100);
  };

  if (loading) {
    return (
      <div className="budgets-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="budgets-page">
      <div className="budgets-header">
        <h1>My Budgets</h1>
        <button
          className="btn btn-success"
          onClick={() => navigate("/budgets/create")}
        >
          + Create New Budget
        </button>
      </div>

      <div className="budget-filters">
        <button
          className={`filter-button ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Budgets ({budgets.length})
        </button>
        <button
          className={`filter-button ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active ({budgets.filter((b) => b.isActive).length})
        </button>
        <button
          className={`filter-button ${filter === "inactive" ? "active" : ""}`}
          onClick={() => setFilter("inactive")}
        >
          Inactive ({budgets.filter((b) => !b.isActive).length})
        </button>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <h2>No {filter !== "all" ? filter : ""} budgets found</h2>
          <p>
            {filter === "all"
              ? "Get started by creating your first budget!"
              : `You don't have any ${filter} budgets yet.`}
          </p>
          {filter === "all" && (
            <button
              className="btn btn-success"
              onClick={() => navigate("/budgets/create")}
            >
              Create Your First Budget
            </button>
          )}
        </div>
      ) : (
        <div className="budgets-grid">
          {filteredBudgets.map((budget) => {
            const percentage = calculatePercentage(
              budget.totalSpent,
              budget.totalAmount
            );

            return (
              <div
                key={budget.id}
                className={`budget-card ${!budget.isActive ? "inactive" : ""}`}
              >
                <div className="budget-card-header">
                  <div className="budget-card-title">
                    <h3>{budget.name}</h3>
                    <div className="budget-card-meta">
                      {BudgetPeriodLabels[budget.period]} |{" "}
                      {formatDate(budget.startDate)} -{" "}
                      {formatDate(budget.endDate)}
                    </div>
                    {budget.description && (
                      <div className="budget-card-description">
                        {budget.description}
                      </div>
                    )}
                  </div>
                  <Badge variant={budget.isActive ? "success" : "inactive"}>
                    {budget.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>

                <hr className="budget-card-divider" />

                <div className="budget-card-stats">
                  <div className="budget-stat">
                    <div className="budget-stat-label">Spent</div>
                    <div className="budget-stat-value spent">
                      {formatCurrency(budget.totalSpent)}
                    </div>
                  </div>
                  <div className="budget-stat">
                    <div className="budget-stat-label">Budget</div>
                    <div className="budget-stat-value">
                      {formatCurrency(budget.totalAmount)}
                    </div>
                  </div>
                  <div className="budget-stat">
                    <div className="budget-stat-label">Remaining</div>
                    <div className="budget-stat-value remaining">
                      {formatCurrency(budget.totalAmount - budget.totalSpent)}
                    </div>
                  </div>
                </div>

                <div className="budget-card-progress">
                  <ProgressBar percentage={percentage} />
                  <div className="budget-card-progress-text">
                    {percentage}% of budget used
                  </div>
                </div>

                <div className="budget-card-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/budgets/${budget.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/budgets/${budget.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(budget.id, budget.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
