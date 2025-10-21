import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import budgetService from "../../services/budgetService";
import categoryService from "../../services/categoryService";
import { BudgetPeriod, BudgetPeriodLabels } from "../../utils/constants";
import { formatCurrency } from "../../utils/formatters";
import Spinner from "../../components/common/Spinner";
import "../../styles/EditBudgetPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const EditBudgetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Category allocations with spent amounts
  const [allocations, setAllocations] = useState([]);

  // For adding new allocations
  const [newAllocation, setNewAllocation] = useState({
    categoryId: "",
    allocatedAmount: "",
  });

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      console.error("❌ No ID found in params!");
    }
  }, [id]);

  // Debug: Monitor formData changes
  useEffect(() => {}, [formData]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch categories FIRST so we can use them for allocation matching
      let categoriesData = [];
      try {
        const categoriesResponse = await categoryService.getExpenses();
        if (categoriesResponse.success) {
          categoriesData = categoriesResponse.data;
          setCategories(categoriesData);
        }
      } catch (catError) {
        console.error("Failed to load categories:", catError);
      }

      // Get complete budget data
      let budgetResponse;
      try {
        budgetResponse = await budgetService.getById(id);
        console.log("Budget getById response:", budgetResponse);
      } catch (error) {
        console.error("Failed to get budget details:", error);
        throw error;
      }

      // If we need more detailed allocation data, try visualization endpoint
      let visualizationData = null;
      try {
        const vizResponse = await budgetService.getVisualization(id);
        if (vizResponse?.data?.allocationBreakdown) {
          visualizationData = vizResponse.data;
        }
      } catch (vizError) {
        console.log(
          "Visualization failed, using basic allocation data:",
          vizError
        );
      }

      // Handle different response formats
      let budget;
      if (budgetResponse && budgetResponse.success && budgetResponse.data) {
        budget = budgetResponse.data;
      } else if (budgetResponse && budgetResponse.data) {
        budget = budgetResponse.data;
      } else if (budgetResponse) {
        budget = budgetResponse;
      } else {
        throw new Error("No budget data received");
      }

      if (!budget) {
        toast.error("Failed to fetch budget");
        navigate("/budgets");
        return;
      }

      // Set form data - using correct API property names
      const formDataToSet = {
        name: budget.budgetName || budget.name || "",
        totalAmount: budget.totalAmount || "",
        period: budget.period || BudgetPeriod.MONTHLY,
        startDate: budget.startDate ? budget.startDate.split("T")[0] : "",
        endDate: budget.endDate ? budget.endDate.split("T")[0] : "",
        description: budget.description || "",
        isActive: budget.isActive !== undefined ? budget.isActive : true,
      };

      setFormData(formDataToSet);

      // Set allocations - prefer budget data for allocations (has categoryId)
      console.log("Budget data for edit:", budget);
      console.log("Budget keys:", Object.keys(budget));
      console.log("Budget categoryAllocations:", budget.categoryAllocations);
      console.log("Budget allocations:", budget.allocations);
      console.log("Visualization data:", visualizationData);

      let allocationsData = [];

      // Prefer budget data for allocations (has categoryId), enhance with visualization if needed
      if (
        budget.categoryAllocations &&
        Array.isArray(budget.categoryAllocations)
      ) {
        allocationsData = budget.categoryAllocations;
      } else if (budget.allocations && Array.isArray(budget.allocations)) {
        allocationsData = budget.allocations;
      } else if (
        budget.allocationBreakdown &&
        Array.isArray(budget.allocationBreakdown)
      ) {
        allocationsData = budget.allocationBreakdown;
      } else if (
        visualizationData?.allocationBreakdown &&
        Array.isArray(visualizationData.allocationBreakdown)
      ) {
        allocationsData = visualizationData.allocationBreakdown;
      }

      console.log("Using allocations data:", allocationsData);
      console.log(
        "Raw allocation structure:",
        allocationsData.map((a) => ({
          keys: Object.keys(a),
          values: a,
        }))
      );

      // Transform allocation data to match the form structure
      const transformedAllocations = allocationsData.map(
        (allocation, index) => {
          console.log(`Transforming allocation ${index}:`, allocation);

          // Try to get categoryId from multiple sources
          let categoryId =
            allocation.categoryId || allocation.id || allocation.Category?.id;

          // If no categoryId from allocation data, try to match with categories by name
          if (
            !categoryId &&
            allocation.categoryName &&
            categoriesData.length > 0
          ) {
            const matchingCategory = categoriesData.find(
              (cat) =>
                cat.name === allocation.categoryName ||
                cat.name.toLowerCase() === allocation.categoryName.toLowerCase()
            );
            if (matchingCategory) {
              categoryId = matchingCategory.id;
              console.log(
                `🔍 Matched category "${allocation.categoryName}" to ID: ${categoryId}`
              );
            } else {
              console.log(
                `❌ Could not match category "${allocation.categoryName}"`
              );
            }
          }

          const result = {
            categoryId: categoryId,
            categoryName:
              allocation.categoryName ||
              allocation.name ||
              allocation.Category?.name,
            categoryIcon:
              allocation.categoryIcon ||
              allocation.icon ||
              allocation.Category?.icon,
            allocatedAmount:
              allocation.allocatedAmount || allocation.budgetedAmount || 0,
          };

          return result;
        }
      );

      console.log("Transformed allocations:", transformedAllocations);
      setAllocations(transformedAllocations);
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Provide specific error message to user
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load budget";
      toast.error(errorMessage);

      // Only navigate away if it's a 404 (budget not found)
      if (error.response?.status === 404) {
        navigate("/budgets");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      return updated;
    });
  };

  const handleAllocationChange = (categoryId, newAmount) => {
    setAllocations((prev) =>
      prev.map((allocation) =>
        allocation.categoryId === categoryId
          ? { ...allocation, allocatedAmount: parseFloat(newAmount) || 0 }
          : allocation
      )
    );
  };

  const handleRemoveAllocation = (categoryId) => {
    if (!window.confirm("Remove this category allocation?")) {
      return;
    }
    setAllocations((prev) => prev.filter((a) => a.categoryId !== categoryId));
    toast.success("Category removed");
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
        categoryColor: category.color,
        allocatedAmount: parseFloat(newAllocation.allocatedAmount),
        spentAmount: 0, // New allocations have 0 spent
      },
    ]);

    setNewAllocation({ categoryId: "", allocatedAmount: "" });
    toast.success("Category added");
  };

  const calculateTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  };

  const calculateTotalSpent = () => {
    return allocations.reduce((sum, a) => sum + (a.spentAmount || 0), 0);
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
      setSaving(true);

      const budgetData = {
        name: formData.name.trim(),
        totalAmount: totalAmount,
        period: parseInt(formData.period),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description.trim(),
        isActive: formData.isActive,
        categoryAllocations: allocations
          .filter((a) => {
            const isValid =
              a.categoryId !== null &&
              a.categoryId !== undefined &&
              a.categoryId !== "";
            console.log(`Filtering allocation:`, {
              categoryId: a.categoryId,
              isValid,
              allocation: a,
            });
            return isValid;
          })
          .map((a) => {
            const result = {
              categoryId: a.categoryId, // Keep as original type like create budget
              allocatedAmount: isNaN(parseFloat(a.allocatedAmount))
                ? 0
                : parseFloat(a.allocatedAmount),
            };
            console.log(`Mapping allocation:`, { input: a, output: result });
            return result;
          }),
      };

      // Validate the data before sending
      console.log("Budget ID:", id);
      console.log("Budget Data:", JSON.stringify(budgetData, null, 2));
      console.log("Raw allocations state:", allocations);

      // Check for invalid values with more detailed logging
      const invalidAllocations = budgetData.categoryAllocations.filter(
        (a, index) => {
          const hasValidCategoryId =
            a.categoryId !== null &&
            a.categoryId !== undefined &&
            a.categoryId !== "" &&
            (typeof a.categoryId === "string" ||
              typeof a.categoryId === "number");
          const hasValidAmount =
            !isNaN(a.allocatedAmount) && a.allocatedAmount >= 0; // Allow 0 as valid

          if (!hasValidCategoryId) {
            console.error(
              `❌ Invalid categoryId at index ${index}:`,
              a.categoryId,
              typeof a.categoryId
            );
          }
          if (!hasValidAmount) {
            console.error(
              `❌ Invalid allocatedAmount at index ${index}:`,
              a.allocatedAmount,
              typeof a.allocatedAmount
            );
          }

          return !hasValidCategoryId || !hasValidAmount;
        }
      );

      if (invalidAllocations.length > 0) {
        console.error("❌ Invalid allocations found:", invalidAllocations);
        console.error("Full allocation details:");
        budgetData.categoryAllocations.forEach((allocation, index) => {
          console.error(`Allocation ${index}:`, {
            categoryId: allocation.categoryId,
            categoryIdType: typeof allocation.categoryId,
            allocatedAmount: allocation.allocatedAmount,
            allocatedAmountType: typeof allocation.allocatedAmount,
            isNaN: isNaN(allocation.allocatedAmount),
          });
        });

        // TEMPORARY: Let's see what the server says instead of blocking here
        console.warn(
          "⚠️ TEMPORARY: Proceeding despite validation errors to see server response"
        );
        // toast.error(
        //   "Invalid allocation data detected. Please check your entries."
        // );
        // return;
      }

      // Validate required fields
      if (
        !budgetData.name ||
        budgetData.totalAmount <= 0 ||
        !budgetData.startDate ||
        !budgetData.endDate
      ) {
        console.error("❌ Missing required fields");
        toast.error("Missing required budget information");
        return;
      }

      const response = await budgetService.update(id, budgetData);

      // Check if response indicates success
      // The API interceptor returns response.data directly, so we need to check for success indicators
      if (response && response.success !== false) {
        toast.success("Budget updated successfully!");
        navigate(`/budgets/${id}`);
      } else {
        console.error("Update failed with response:", response);
        toast.error(response?.message || "Failed to update budget");
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Handle 400 Bad Request specifically
      if (error.response?.status === 400) {
        console.error("🚨 400 Bad Request Details:");
        console.error("Request URL:", error.config?.url);
        console.error("Request Data:", error.config?.data);
        console.error("Response Data:", error.response?.data);

        // Try to extract validation errors
        const validationErrors = error.response?.data?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          console.error("Validation Errors:", validationErrors);
          toast.error(`Validation Error: ${validationErrors.join(", ")}`);
        } else if (error.response?.data?.message) {
          toast.error(`Bad Request: ${error.response.data.message}`);
        } else {
          toast.error("Bad Request: Please check your input data");
        }
        return;
      }

      // Handle 500 Internal Server Error specifically
      if (error.response?.status === 500) {
        console.error("🔥 500 Internal Server Error Details:");
        console.error("Request URL:", error.config?.url);
        console.error(
          "Request Data:",
          JSON.stringify(JSON.parse(error.config?.data || "{}"), null, 2)
        );
        console.error("Response Data:", error.response?.data);
        console.error("Server Error Message:", error.response?.data?.message);
        console.error("Stack Trace:", error.response?.data?.stackTrace);

        if (error.response?.data?.message) {
          toast.error(`Server Error: ${error.response.data.message}`);
        } else {
          toast.error("Internal server error occurred while updating budget");
        }
        return;
      }

      // Provide specific error message to user
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        error.message ||
        "Failed to update budget";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(`Are you sure you want to delete "${formData.name}"?`)
    ) {
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

  if (loading) {
    return (
      <div className="edit-budget-loading">
        <Spinner />
      </div>
    );
  }

  const totalAllocated = calculateTotalAllocated();
  const totalSpent = calculateTotalSpent();
  const totalBudget = parseFloat(formData.totalAmount) || 0;
  const unallocated = totalBudget - totalAllocated;
  const isOverAllocated = totalAllocated > totalBudget;

  return (
    <div className="edit-budget-page">
      <h1>Edit Budget: {formData.name}</h1>

      <form onSubmit={handleSubmit}>
        <div className="edit-budget-form-card">
          <div className="edit-budget-section">
            <h3>Budget Details</h3>

            <div className="form-group">
              <label className="label">Budget Name *</label>
              <input
                type="text"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="edit-form-row">
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

            <div className="edit-form-row">
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
                <span>Active Budget</span>
              </label>
            </div>
          </div>

          <hr className="edit-budget-divider" />

          <div className="edit-budget-section">
            <h3>Category Allocations</h3>

            <h4
              style={{
                marginTop: "20px",
                marginBottom: "15px",
                color: "var(--gray-800)",
              }}
            >
              Current Allocations
            </h4>

            {allocations.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--gray-500)",
                  fontStyle: "italic",
                }}
              >
                No categories allocated yet. Add categories below.
              </div>
            ) : (
              <table className="edit-allocations-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Allocated</th>
                    <th>Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map((allocation, index) => (
                    <tr key={`allocation-${allocation.categoryId || index}`}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span style={{ fontSize: "24px" }}>
                            {allocation.categoryIcon}
                          </span>
                          <span>{allocation.categoryName}</span>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="edit-allocation-input"
                          value={allocation.allocatedAmount}
                          onChange={(e) =>
                            handleAllocationChange(
                              allocation.categoryId,
                              e.target.value
                            )
                          }
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td className="edit-spent-amount">
                        {formatCurrency(allocation.spentAmount || 0)}
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

            <h4
              style={{
                marginTop: "30px",
                marginBottom: "15px",
                color: "var(--gray-800)",
              }}
            >
              Add New Category
            </h4>

            <div
              style={{
                background: "var(--gray-50)",
                border: "2px solid var(--gray-200)",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "15px",
                  alignItems: "flex-end",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
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

                <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div
              className={`edit-allocation-summary ${
                isOverAllocated ? "over-allocated" : ""
              }`}
            >
              <div className="edit-allocation-row">
                <strong>Total Allocated:</strong>
                <span>
                  {formatCurrency(totalAllocated)} /{" "}
                  {formatCurrency(totalBudget)}
                </span>
              </div>
              <div className="edit-allocation-row">
                <strong>Total Spent:</strong>
                <span style={{ color: "var(--danger)" }}>
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <div
                className={`edit-allocation-row ${
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

          <div className="edit-form-actions">
            <div className="edit-form-actions-left">
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
                onClick={() => navigate(`/budgets/${id}`)}
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
              Delete Budget
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBudgetPage;
