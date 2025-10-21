import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import budgetService from "../../services/budgetService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { BudgetPeriodLabels, getProgressColor } from "../../utils/constants";
import ProgressBar from "../../components/common/ProgressBar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import "../../styles/BudgetDetailsPage.css";
import "../../styles/Button.css";
import "../../styles/Badge.css";

const BudgetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBudgetDetail();

    // Refresh data when user returns to this page
    const handleFocus = () => {
      fetchBudgetDetail();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        fetchBudgetDetail();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [id]);

  const fetchBudgetDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get basic budget data first (has name, description, isActive)
      const budgetResponse = await budgetService.getById(id);

      // Get visualization data (has spending totals and allocation details)
      // Add cache busting parameter to ensure fresh data
      const vizResponse = await budgetService.getVisualization(id);

      if (budgetResponse.success && vizResponse.success) {
        // Combine both data sources
        const combinedBudget = {
          ...budgetResponse.data, // Basic budget info (name, description, isActive, etc.)
          ...vizResponse.data, // Visualization data (totals, allocations, etc.)
        };

        setBudget(combinedBudget);
      } else {
        const errorMsg =
          budgetResponse.message ||
          vizResponse.message ||
          "Failed to fetch budget details";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
      setError("Failed to load budget details");
      toast.error("Failed to load budget details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${budget.name}"?`)) {
      return;
    }

    try {
      const response = await budgetService.delete(id);
      if (response.success) {
        toast.success("Budget deleted successfully");
        navigate("/budgets");
      } else {
        toast.error(response.message || "Failed to delete budget");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const calculatePercentage = (spent, allocated) => {
    if (allocated === 0) return 0;
    return Math.round((spent / allocated) * 100);
  };

  if (loading) {
    return (
      <div className="budget-detail-loading">
        <Spinner />
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="budget-detail-error">
        <h2>Error Loading Budget</h2>
        <p>{error || "Budget not found"}</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/budgets")}
        >
          Back to Budgets
        </button>
      </div>
    );
  }

  const overallPercentage = calculatePercentage(
    budget.totalSpent,
    budget.totalAmount
  );
  const remaining = budget.totalAmount - budget.totalSpent;

  // Prepare data for Pie Chart (Allocation Breakdown)
  // Use categoryComparisons instead of allocationBreakdown since it contains spending data
  const allocationsArray =
    budget.categoryComparisons || budget.allocationBreakdown || [];

  const pieData = allocationsArray.map((allocation) => ({
    name: allocation.categoryName || allocation.name,
    value: allocation.allocatedAmount || allocation.budgetedAmount,
    color: allocation.categoryColor || allocation.color,
  }));

  // Prepare data for Bar Chart (Allocated vs Spent)
  const barData = allocationsArray.map((allocation) => ({
    name:
      allocation.categoryName.length > 15
        ? allocation.categoryName.substring(0, 15) + "..."
        : allocation.categoryName,
    allocated: allocation.allocatedAmount,
    spent: allocation.spentAmount,
  }));

  return (
    <div className="budget-detail-page">
      {/* Budget Header Card */}
      <div className="budget-header-card">
        <div className="budget-header-top">
          <div className="budget-header-info">
            <h1>{budget.name || budget.budgetName || "Unnamed Budget"}</h1>
            <div className="budget-header-meta">
              {BudgetPeriodLabels[budget.period]} |{" "}
              {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
            </div>
            {budget.description && (
              <div className="budget-header-description">
                {budget.description}
              </div>
            )}
          </div>
          <div className="budget-header-actions">
            <Badge variant={budget.isActive ? "success" : "inactive"}>
              {budget.isActive ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/budgets/${id}/edit`)}
            >
              Edit Budget
            </button>
            <button
              className="btn btn-secondary"
              onClick={fetchBudgetDetail}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
            <button
              className="btn btn-success"
              onClick={() => navigate("/transactions/add")}
            >
              + Add Transaction
            </button>
          </div>
        </div>

        <hr className="budget-header-divider" />

        <div className="budget-stats-grid">
          <div className="budget-stat-item">
            <div className="budget-stat-label">Total Budget</div>
            <div className="budget-stat-value">
              {formatCurrency(budget.totalAmount)}
            </div>
          </div>
          <div className="budget-stat-item">
            <div className="budget-stat-label">Total Spent</div>
            <div className="budget-stat-value spent">
              {formatCurrency(budget.totalSpent)}
            </div>
          </div>
          <div className="budget-stat-item">
            <div className="budget-stat-label">Remaining</div>
            <div className="budget-stat-value remaining">
              {formatCurrency(remaining)}
            </div>
          </div>
        </div>

        <div className="budget-overall-progress">
          <div className="budget-progress-label">
            Overall Progress: {overallPercentage}% used
          </div>
          <ProgressBar percentage={overallPercentage} height={40} />
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="visualizations-section">
        <h2>Budget Visualizations</h2>
        <div className="charts-grid">
          {/* Pie Chart - Allocation Breakdown */}
          <div className="chart-card">
            <h3>Budget Allocation Breakdown</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Allocated vs Spent */}
          <div className="chart-card">
            <h3>Allocated vs Spent</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#667eea" name="Allocated" />
                  <Bar dataKey="spent" fill="#e53e3e" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details Section */}
      <div className="category-details-section">
        <h2>Category Details</h2>
        {allocationsArray.map((allocation, index) => {
          const spentAmount = allocation.spentAmount || allocation.spent || 0;
          const allocatedAmount =
            allocation.allocatedAmount || allocation.budgetedAmount || 0;

          const percentage = calculatePercentage(spentAmount, allocatedAmount);
          const categoryRemaining = allocatedAmount - spentAmount;
          const isOver = spentAmount > allocatedAmount;

          return (
            <div
              key={allocation.categoryId || allocation.id || index}
              className="category-detail-card"
            >
              <div className="category-detail-header">
                <div className="category-detail-title">
                  <span className="category-detail-icon">
                    {allocation.categoryIcon || allocation.icon || "📁"}
                  </span>
                  <span className="category-detail-name">
                    {allocation.categoryName ||
                      allocation.name ||
                      "Unknown Category"}
                  </span>
                </div>
                <div className="category-detail-amounts">
                  <div className="category-detail-amount">
                    {formatCurrency(spentAmount)}
                  </div>
                  <div className="category-detail-total">
                    / {formatCurrency(allocatedAmount)}
                  </div>
                </div>
              </div>

              <div className="category-detail-progress">
                <ProgressBar percentage={percentage} />
              </div>

              <div className="category-detail-stats">
                <span className="category-detail-stat used">
                  {percentage}% used
                </span>
                <span
                  className={`category-detail-stat ${
                    isOver ? "over" : "remaining"
                  }`}
                >
                  {isOver ? "Over by " : ""}
                  {formatCurrency(Math.abs(categoryRemaining))}{" "}
                  {isOver ? "" : "remaining"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetDetailPage;
