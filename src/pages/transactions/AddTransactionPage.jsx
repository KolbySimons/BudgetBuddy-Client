import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import transactionService from "../../services/transactionService";
import budgetService from "../../services/budgetService";
import categoryService from "../../services/categoryService";
import { TransactionType } from "../../utils/constants";
import Spinner from "../../components/common/Spinner";
import "../../styles/AddTransactionPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    transactionDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    budgetId: "",
    type: TransactionType.EXPENSE,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter categories based on selected type
    if (formData.type === TransactionType.EXPENSE) {
      const expenseCategories = allCategories.filter((c) => c.type === 0);
      setCategories(expenseCategories);
    } else {
      const incomeCategories = allCategories.filter((c) => c.type === 1);
      setCategories(incomeCategories);
    }
    // Reset category selection when type changes
    setFormData((prev) => ({ ...prev, categoryId: "" }));
  }, [formData.type, allCategories]);

  const fetchData = async () => {
    try {
      // Fetch budgets
      const budgetsResponse = await budgetService.getAll();
      if (budgetsResponse.success) {
        setBudgets(budgetsResponse.data);
      }

      // Fetch all categories
      const categoriesResponse = await categoryService.getAll();
      if (categoriesResponse.success) {
        setAllCategories(categoriesResponse.data);
        // Set initial categories (expense by default)
        const expenseCategories = categoriesResponse.data.filter(
          (c) => c.type === 0
        );
        setCategories(expenseCategories);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load form data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, type: parseInt(type) }));
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
      setLoading(true);

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate,
        categoryId: formData.categoryId,
        budgetId: formData.budgetId || null,
        type: formData.type,
        notes: formData.notes.trim(),
      };

      console.log("Sending transaction data:", transactionData);

      const response = await transactionService.create(transactionData);

      if (response.success) {
        toast.success("Transaction added successfully!");

        // If transaction is linked to a budget, recalculate budget totals
        if (transactionData.budgetId) {
          try {
            const recalcResponse = await budgetService.recalculate(
              transactionData.budgetId
            );

            // Give a longer delay to ensure backend processing is complete
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } catch (recalcError) {
            console.error("⚠️ Failed to recalculate budget:", recalcError);
            // Don't show error to user since transaction was successful
          }
        }

        navigate("/transactions", {
          state: { budgetRecalculated: transactionData.budgetId },
        });
      } else {
        toast.error(response.message || "Failed to add transaction");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-transaction-page">
      <h1>Add Transaction</h1>

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
              This transaction will automatically update the spent amount for
              the selected category in your budget.
            </p>
          </div>

          <div className="transaction-form-actions">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? <Spinner size="small" /> : "Save Transaction"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/transactions")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionPage;
