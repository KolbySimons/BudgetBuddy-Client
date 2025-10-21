import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import budgetService from "../../services/budgetService";
import categoryService from "../../services/categoryService";
import { BudgetPeriod, BudgetPeriodLabels } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import Spinner from "../../components/common/Spinner";
import "../../styles/CreateBudgetPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const CreateBudgetPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    period: BudgetPeriod.MONTHLY,
    startDate: "",
    endDate: "",
    description: "",
    isActive: true,
  });

  // Category allocations
  const [allocations, setAllocations] = useState([]);
  const [newAllocation, setNewAllocation] = useState({
    categoryId: "",
    allocatedAmount: "",
  });

  useEffect(() => {
    fetchCategories();

    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setFormData((prev) => ({
      ...prev,
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    }));
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getExpenses();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAllocation = () => {
    if (!newAllocation.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (
      !newAllocation.allocatedAmount ||
      parseFloat(newAllocation.allocatedAmount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if category already allocated
    if (allocations.find((a) => a.categoryId === newAllocation.categoryId)) {
      toast.error("Category already allocated");
      return;
    }

    const category = categories.find((c) => c.id === newAllocation.categoryId);
    setAllocations((prev) => [
      ...prev,
      {
        categoryId: newAllocation.categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        allocatedAmount: parseFloat(newAllocation.allocatedAmount),
      },
    ]);

    // Reset form
    setNewAllocation({ categoryId: "", allocatedAmount: "" });
    toast.success("Category added");
  };

  const handleRemoveAllocation = (categoryId) => {
    setAllocations((prev) => prev.filter((a) => a.categoryId !== categoryId));
    toast.success("Category removed");
  };

  const calculateTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a budget name");
      return;
    }
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error("Please enter a valid total amount");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }
    if (allocations.length === 0) {
      toast.error("Please add at least one category allocation");
      return;
    }

    const totalAllocated = calculateTotalAllocated();
    const totalAmount = parseFloat(formData.totalAmount);

    if (totalAllocated > totalAmount) {
      toast.error("Total allocated exceeds budget amount");
      return;
    }

    try {
      setLoading(true);

      const budgetData = {
        name: formData.name.trim(),
        totalAmount: totalAmount,
        period: parseInt(formData.period),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        isActive: formData.isActive,
        categoryAllocations: allocations.map((a) => ({
          categoryId: a.categoryId,
          allocatedAmount: a.allocatedAmount,
        })),
      };

      const response = await budgetService.create(budgetData);

      if (response.success) {
        toast.success("Budget created successfully!");
        navigate("/budgets");
      } else {
        toast.error(response.message || "Failed to create budget");
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = calculateTotalAllocated();
  const totalBudget = parseFloat(formData.totalAmount) || 0;
  const unallocated = totalBudget - totalAllocated;
  const isOverAllocated = totalAllocated > totalBudget;

  return (
    <div className="create-budget-page">
      <h1>Create New Budget</h1>

      <form onSubmit={handleSubmit}>
        <div className="budget-form-card">
          <div className="budget-form-section">
            <h3>Budget Details</h3>

            <div className="form-group">
              <label className="label">Budget Name *</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder='e.g., "January 2025", "Vacation Fund"'
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Total Amount *</label>
                <input
                  type="number"
                  name="totalAmount"
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Period *</label>
                <select
                  name="period"
                  className="input"
                  value={formData.period}
                  onChange={handleInputChange}
                  required
                >
                  {Object.entries(BudgetPeriodLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="input"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="input"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Description (Optional)</label>
              <textarea
                name="description"
                className="input"
                placeholder="Budget goals or notes..."
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span>Set as Active Budget</span>
              </label>
            </div>
          </div>

          <hr className="budget-form-divider" />

          <div className="budget-form-section">
            <h3>Allocate to Categories</h3>

            <div className="allocation-form">
              <div className="allocation-row">
                <div className="form-group">
                  <label className="label">Category *</label>
                  <select
                    className="input"
                    value={newAllocation.categoryId}
                    onChange={(e) =>
                      setNewAllocation((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter(
                        (c) => !allocations.find((a) => a.categoryId === c.id)
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Allocated Amount *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={newAllocation.allocatedAmount}
                    onChange={(e) =>
                      setNewAllocation((prev) => ({
                        ...prev,
                        allocatedAmount: e.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAddAllocation}
                >
                  + Add
                </button>
              </div>
            </div>

            <h4
              style={{
                marginTop: "30px",
                marginBottom: "15px",
                color: "var(--gray-800)",
              }}
            >
              Allocated Categories
            </h4>

            {allocations.length === 0 ? (
              <div className="empty-allocations">
                No categories allocated yet. Add categories above.
              </div>
            ) : (
              <table className="allocations-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation) => (
                    <tr key={allocation.categoryId}>
                      <td>
                        <div className="category-cell">
                          <span className="category-icon">
                            {allocation.categoryIcon}
                          </span>
                          <span>{allocation.categoryName}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: "600" }}>
                        {formatCurrency(allocation.allocatedAmount)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleRemoveAllocation(allocation.categoryId)
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div
              className={`allocation-summary ${
                isOverAllocated ? "over-allocated" : ""
              }`}
            >
              <div className="allocation-summary-row">
                <strong>Total Allocated:</strong>
                <span>
                  {formatCurrency(totalAllocated)} /{" "}
                  {formatCurrency(totalBudget)}
                </span>
              </div>
              <div
                className={`allocation-summary-row ${
                  isOverAllocated ? "over-allocated" : "unallocated"
                }`}
              >
                <strong>
                  {isOverAllocated ? "Over Allocated:" : "Unallocated:"}
                </strong>
                <span>{formatCurrency(Math.abs(unallocated))}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? <Spinner size="small" /> : "Save Budget"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/budgets")}
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

export default CreateBudgetPage;
