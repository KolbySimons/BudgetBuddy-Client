import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import transactionService from "../../services/transactionService";
import budgetService from "../../services/budgetService";
import categoryService from "../../services/categoryService";
import { TransactionType } from "../../utils/constants";
import Spinner from "../../components/common/Spinner";
import "../../styles/AddTransactionPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const EditTransactionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transactionDate: "",
    categoryId: "",
    budgetId: "",
    type: TransactionType.EXPENSE,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    // Filter categories based on selected type
    if (formData.type === TransactionType.EXPENSE) {
      const expenseCategories = allCategories.filter((c) => c.type === 0);
      setCategories(expenseCategories);
    } else {
      const incomeCategories = allCategories.filter((c) => c.type === 1);
      setCategories(incomeCategories);
    }
  }, [formData.type, allCategories]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch transaction details
      const transactionResponse = await transactionService.getById(id);
      if (!transactionResponse.success) {
        toast.error("Failed to fetch transaction");
        navigate("/transactions");
        return;
      }

      const transaction = transactionResponse.data;
      setFormData({
        description: transaction.description,
        amount: transaction.amount,
        transactionDate: transaction.transactionDate.split("T")[0],
        categoryId: transaction.categoryId,
        budgetId: transaction.budgetId || "",
        type: transaction.type,
        notes: transaction.notes || "",
      });

      // Fetch budgets
      const budgetsResponse = await budgetService.getAll();
      if (budgetsResponse.success) {
        setBudgets(budgetsResponse.data);
      }

      // Fetch all categories
      const categoriesResponse = await categoryService.getAll();
      if (categoriesResponse.success) {
        setAllCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load transaction");
      navigate("/transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type: parseInt(type), categoryId: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!formData.transactionDate) {
      toast.error("Please select a date");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate,
        categoryId: formData.categoryId,
        budgetId: formData.budgetId || null,
        type: formData.type,
        notes: formData.notes.trim(),
      };

      const response = await transactionService.update(id, transactionData);

      if (response.success) {
        toast.success("Transaction updated successfully!");

        // If transaction is linked to a budget, recalculate budget totals
        if (transactionData.budgetId) {
          try {
            await budgetService.recalculate(transactionData.budgetId);
          } catch (recalcError) {
            console.error("⚠️ Failed to recalculate budget:", recalcError);
            // Don't show error to user since transaction was successful
          }
        }

        navigate("/transactions");
      } else {
        toast.error(response.message || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${formData.description}"?`
      )
    ) {
      return;
    }

    try {
      const response = await transactionService.delete(id);
      if (response.success) {
        toast.success("Transaction deleted successfully");

        // If transaction was linked to a budget, recalculate budget totals
        if (formData.budgetId) {
          try {
            await budgetService.recalculate(formData.budgetId);
          } catch (recalcError) {
            console.error("⚠️ Failed to recalculate budget:", recalcError);
            // Don't show error to user since deletion was successful
          }
        }

        navigate("/transactions");
      } else {
        toast.error(response.message || "Failed to delete transaction");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  if (loading) {
    return (
      <div className="add-transaction-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="add-transaction-page">
      <h1>Edit Transaction</h1>

      <form onSubmit={handleSubmit}>
        <div className="transaction-form-card">
          <h3>Transaction Details</h3>

          <div className="form-group">
            <label className="label">Description *</label>
            <input
              type="text"
              name="description"
              className="input"
              placeholder='e.g., "Walmart groceries", "Netflix subscription"'
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="transaction-form-row">
            <div className="form-group">
              <label className="label">Amount *</label>
              <input
                type="number"
                name="amount"
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Transaction Date *</label>
              <input
                type="date"
                name="transactionDate"
                className="input"
                value={formData.transactionDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Type *</label>
            <div className="transaction-type-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="type"
                  value={TransactionType.EXPENSE}
                  checked={formData.type === TransactionType.EXPENSE}
                  onChange={(e) => handleTypeChange(e.target.value)}
                />
                <span>Expense</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="type"
                  value={TransactionType.INCOME}
                  checked={formData.type === TransactionType.INCOME}
                  onChange={(e) => handleTypeChange(e.target.value)}
                />
                <span>Income</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Category *</label>
            <select
              name="categoryId"
              className="input"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Link to Budget (Optional)</label>
            <select
              name="budgetId"
              className="input"
              value={formData.budgetId}
              onChange={handleInputChange}
            >
              <option value="">None</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Notes (Optional)</label>
            <textarea
              name="notes"
              className="input"
              placeholder="Additional notes about this transaction..."
              rows="4"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="transaction-info-box">
            <strong>ℹ️ Note:</strong>
            <p style={{ margin: "5px 0 0 0", color: "#744210" }}>
              Changes to this transaction will update the spent amount for the
              selected category in your budget.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "35px",
            }}
          >
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                type="submit"
                className="btn btn-success"
                disabled={saving}
              >
                {saving ? <Spinner size="small" /> : "Save Changes"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/transactions")}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete Transaction
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditTransactionPage;
