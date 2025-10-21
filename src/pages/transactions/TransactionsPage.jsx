import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import transactionService from "../../services/transactionService";
import budgetService from "../../services/budgetService";
import categoryService from "../../services/categoryService";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { TransactionType } from "../../utils/constants";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import "../../styles/TransactionsPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";
import "../../styles/Badge.css";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    budgetId: "",
    categoryId: "",
    type: "",
    startDate: "",
    endDate: "",
    pageNumber: 1,
    pageSize: 10,
  });

  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters.pageNumber]);

  const fetchInitialData = async () => {
    try {
      // Fetch budgets for filter
      const budgetsResponse = await budgetService.getAll();
      if (budgetsResponse.success) {
        setBudgets(budgetsResponse.data);
      }

      // Fetch categories for filter
      const categoriesResponse = await categoryService.getAll();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Fetch transactions
      await fetchTransactions();
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Build filter object (only include non-empty values)
      const filterData = {
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
      };

      if (filters.budgetId) filterData.budgetId = filters.budgetId;
      if (filters.categoryId) filterData.categoryId = filters.categoryId;
      if (filters.type !== "") filterData.type = parseInt(filters.type);
      if (filters.startDate) filterData.startDate = filters.startDate;
      if (filters.endDate) filterData.endDate = filters.endDate;

      const response = await transactionService.getFiltered(filterData);

      if (response && response.success) {
        const transactionData = response.data.items || response.data || [];
        setTransactions(transactionData);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || transactionData.length);
      } else if (response && Array.isArray(response)) {
        // Handle direct array response
        setTransactions(response);
        setTotalPages(1);
        setTotalCount(response.length);
      } else {
        console.error("❌ Unexpected response format:", response);
        toast.error(response?.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      pageNumber: 1, // Reset to first page when filters change
    }));
  };

  const handleApplyFilters = () => {
    fetchTransactions();
  };

  const handleClearFilters = () => {
    setFilters({
      budgetId: "",
      categoryId: "",
      type: "",
      startDate: "",
      endDate: "",
      pageNumber: 1,
      pageSize: 10,
    });
    setTimeout(() => fetchTransactions(), 100);
  };

  const handleDelete = async (id, description) => {
    if (!window.confirm(`Are you sure you want to delete "${description}"?`)) {
      return;
    }

    try {
      // Find the transaction to get its budgetId before deletion
      const transactionToDelete = transactions.find((t) => t.id === id);
      const budgetId = transactionToDelete?.budgetId;

      const response = await transactionService.delete(id);
      if (response.success) {
        toast.success("Transaction deleted successfully");

        // If transaction was linked to a budget, recalculate budget totals
        if (budgetId) {
          try {
            await budgetService.recalculate(budgetId);
          } catch (recalcError) {
            console.error("⚠️ Failed to recalculate budget:", recalcError);
            // Don't show error to user since deletion was successful
          }
        }

        fetchTransactions();
      } else {
        toast.error(response.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, pageNumber: newPage }));
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="transactions-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transaction History</h1>
        <button
          className="btn btn-success"
          onClick={() => navigate("/transactions/add")}
        >
          + Add Transaction
        </button>
      </div>

      {/* Filters Card */}
      <div className="filters-card">
        <h4>Filter Transactions</h4>
        <div className="filters-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Budget</label>
            <select
              name="budgetId"
              className="input"
              value={filters.budgetId}
              onChange={handleFilterChange}
            >
              <option value="">All Budgets</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Category</label>
            <select
              name="categoryId"
              className="input"
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Type</label>
            <select
              name="type"
              className="input"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </select>
          </div>
        </div>

        <div className="filters-grid-dates">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="input"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">End Date</label>
            <input
              type="date"
              name="endDate"
              className="input"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button className="btn btn-primary" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={handleClearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-card">
        {transactions.length === 0 ? (
          <div className="transactions-empty">
            <div className="transactions-empty-icon">📝</div>
            <h2>No Transactions Found</h2>
            <p>
              Start tracking your expenses and income by adding your first
              transaction!
            </p>
            <button
              className="btn btn-success"
              onClick={() => navigate("/transactions/add")}
            >
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <div className="transaction-category">
                        <span className="transaction-category-icon">
                          {transaction.categoryIcon || "📦"}
                        </span>
                        <span>{transaction.categoryName}</span>
                      </div>
                    </td>
                    <td>{transaction.budgetName || "-"}</td>
                    <td>
                      <Badge
                        variant={
                          transaction.type === TransactionType.EXPENSE
                            ? "expense"
                            : "income"
                        }
                      >
                        {transaction.type === TransactionType.EXPENSE
                          ? "Expense"
                          : "Income"}
                      </Badge>
                    </td>
                    <td>
                      <span
                        className={`transaction-amount ${
                          transaction.type === TransactionType.EXPENSE
                            ? "expense"
                            : "income"
                        }`}
                      >
                        {transaction.type === TransactionType.EXPENSE
                          ? "-"
                          : "+"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td>
                      <div className="transaction-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            navigate(`/transactions/${transaction.id}/edit`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(
                              transaction.id,
                              transaction.description
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(filters.pageNumber - 1)}
                  disabled={filters.pageNumber === 1}
                >
                  « Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-button ${
                      filters.pageNumber === index + 1 ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(filters.pageNumber + 1)}
                  disabled={filters.pageNumber === totalPages}
                >
                  Next »
                </button>

                <span className="pagination-info">
                  Showing {(filters.pageNumber - 1) * filters.pageSize + 1} -{" "}
                  {Math.min(filters.pageNumber * filters.pageSize, totalCount)}{" "}
                  of {totalCount}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
