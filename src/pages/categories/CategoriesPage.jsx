import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import categoryService from "../../services/categoryService";
import {
  CategoryType,
  CategoryIcons,
  CategoryColors,
} from "../../utils/constants";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import "../../styles/Categories.css";
import "../../styles/Input.css";
import "../../styles/Button.css";
import "../../styles/Badge.css";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state for create
  const [createForm, setCreateForm] = useState({
    name: "",
    type: CategoryType.EXPENSE,
    icon: "🛒",
    color: "#667eea",
  });

  // Form state for edit
  const [editForm, setEditForm] = useState({
    name: "",
    type: CategoryType.EXPENSE,
    icon: "🛒",
    color: "#667eea",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Fetching categories from API...");
      const response = await categoryService.getAll();
      console.log("Categories API response:", response);

      // Handle different response formats
      if (response && Array.isArray(response)) {
        // Direct array response
        setCategories(response);
      } else if (response && response.success && response.data) {
        // Wrapped response with success flag
        setCategories(response.data);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        setCategories(response.data);
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTypeChange = (type) => {
    setCreateForm((prev) => ({ ...prev, type: parseInt(type) }));
  };

  const handleCreateIconSelect = (icon) => {
    setCreateForm((prev) => ({ ...prev, icon }));
  };

  const handleCreateColorSelect = (color) => {
    setCreateForm((prev) => ({ ...prev, color }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const categoryData = {
        name: createForm.name.trim(),
        type: createForm.type,
        icon: createForm.icon,
        color: createForm.color,
      };

      const response = await categoryService.create(categoryData);

      if (response.success) {
        toast.success("Category created successfully!");
        setCreateForm({
          name: "",
          type: CategoryType.EXPENSE,
          icon: "🛒",
          color: "#667eea",
        });
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTypeChange = (type) => {
    setEditForm((prev) => ({ ...prev, type: parseInt(type) }));
  };

  const handleEditIconSelect = (icon) => {
    setEditForm((prev) => ({ ...prev, icon }));
  };

  const handleEditColorSelect = (color) => {
    setEditForm((prev) => ({ ...prev, color }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editForm.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const categoryData = {
        name: editForm.name.trim(),
        type: editForm.type,
        icon: editForm.icon,
        color: editForm.color,
      };

      const response = await categoryService.update(
        editingCategory.id,
        categoryData
      );

      if (response.success) {
        toast.success("Category updated successfully!");
        setShowEditModal(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (category) => {
    // Check if in use first
    try {
      const inUseResponse = await categoryService.isInUse(category.id);
      if (inUseResponse.success && inUseResponse.data) {
        toast.error(
          "Cannot delete category that is in use by budgets or transactions"
        );
        return;
      }
    } catch (error) {
      console.error("Error checking category usage:", error);
    }

    if (
      !window.confirm(`Are you sure you want to delete "${category.name}"?`)
    ) {
      return;
    }

    try {
      const response = await categoryService.delete(category.id);
      if (response.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const expenseCategories = categories.filter(
    (c) => c.type === CategoryType.EXPENSE
  );
  const incomeCategories = categories.filter(
    (c) => c.type === CategoryType.INCOME
  );
  const systemExpenses = expenseCategories.filter((c) => c.isSystem);
  const customExpenses = expenseCategories.filter((c) => !c.isSystem);
  const systemIncome = incomeCategories.filter((c) => c.isSystem);
  const customIncome = incomeCategories.filter((c) => !c.isSystem);

  if (loading) {
    return (
      <div className="categories-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Manage Categories</h1>
      </div>

      {/* Create Category Form */}
      <div className="create-category-card">
        <h3>Create New Category</h3>
        <form onSubmit={handleCreate}>
          <div className="category-form-row">
            <div className="form-group">
              <label className="label">Category Name *</label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder='e.g., "Coffee Shop", "Pet Care"'
                value={createForm.name}
                onChange={handleCreateInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Type *</label>
              <div className="category-type-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value={CategoryType.EXPENSE}
                    checked={createForm.type === CategoryType.EXPENSE}
                    onChange={(e) => handleCreateTypeChange(e.target.value)}
                  />
                  <span>Expense</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value={CategoryType.INCOME}
                    checked={createForm.type === CategoryType.INCOME}
                    onChange={(e) => handleCreateTypeChange(e.target.value)}
                  />
                  <span>Income</span>
                </label>
              </div>
            </div>
          </div>

          <div className="category-form-row">
            <div className="form-group">
              <label className="label">Icon (Optional)</label>
              <div className="icon-picker">
                {CategoryIcons.map((icon) => (
                  <div
                    key={icon}
                    className={`icon-option ${
                      createForm.icon === icon ? "selected" : ""
                    }`}
                    onClick={() => handleCreateIconSelect(icon)}
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Color (Optional)</label>
              <div className="color-picker">
                {CategoryColors.map((color) => (
                  <div
                    key={color}
                    className={`color-option ${
                      createForm.color === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleCreateColorSelect(color)}
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-success">
            Create Category
          </button>
        </form>
      </div>

      {/* Expense Categories */}
      <div className="category-section">
        <div className="category-section-header">
          <span className="category-section-icon">💳</span>
          <h3>Expense Categories</h3>
        </div>

        {systemExpenses.length > 0 && (
          <>
            <h4
              style={{
                marginBottom: "15px",
                color: "var(--gray-700)",
                fontSize: "16px",
              }}
            >
              System Categories
            </h4>
            <div className="categories-grid">
              {systemExpenses.map((category) => (
                <div key={category.id} className="category-card system">
                  <div className="category-card-header">
                    <div className="category-card-icon">{category.icon}</div>
                    <div className="category-card-info">
                      <div className="category-card-name">{category.name}</div>
                      <Badge variant="system">SYSTEM</Badge>
                    </div>
                  </div>
                  <div
                    className="category-color-preview"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-card-actions">
                    <button className="btn btn-secondary btn-sm" disabled>
                      Cannot Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {customExpenses.length > 0 && (
          <>
            <h4
              style={{
                marginTop: "30px",
                marginBottom: "15px",
                color: "var(--gray-700)",
                fontSize: "16px",
              }}
            >
              Custom Categories
            </h4>
            <div className="categories-grid">
              {customExpenses.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-card-header">
                    <div className="category-card-icon">{category.icon}</div>
                    <div className="category-card-info">
                      <div className="category-card-name">{category.name}</div>
                      <Badge variant="custom">CUSTOM</Badge>
                    </div>
                  </div>
                  <div
                    className="category-color-preview"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditClick(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {customExpenses.length === 0 && systemExpenses.length === 0 && (
          <div className="empty-categories">
            <div className="empty-categories-icon">💳</div>
            <p>No expense categories yet</p>
          </div>
        )}
      </div>

      {/* Income Categories */}
      <div className="category-section">
        <div className="category-section-header">
          <span className="category-section-icon">💰</span>
          <h3>Income Categories</h3>
        </div>

        {systemIncome.length > 0 && (
          <>
            <h4
              style={{
                marginBottom: "15px",
                color: "var(--gray-700)",
                fontSize: "16px",
              }}
            >
              System Categories
            </h4>
            <div className="categories-grid">
              {systemIncome.map((category) => (
                <div key={category.id} className="category-card system">
                  <div className="category-card-header">
                    <div className="category-card-icon">{category.icon}</div>
                    <div className="category-card-info">
                      <div className="category-card-name">{category.name}</div>
                      <Badge variant="system">SYSTEM</Badge>
                    </div>
                  </div>
                  <div
                    className="category-color-preview"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-card-actions">
                    <button className="btn btn-secondary btn-sm" disabled>
                      Cannot Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {customIncome.length > 0 && (
          <>
            <h4
              style={{
                marginTop: "30px",
                marginBottom: "15px",
                color: "var(--gray-700)",
                fontSize: "16px",
              }}
            >
              Custom Categories
            </h4>
            <div className="categories-grid">
              {customIncome.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-card-header">
                    <div className="category-card-icon">{category.icon}</div>
                    <div className="category-card-info">
                      <div className="category-card-name">{category.name}</div>
                      <Badge variant="custom">CUSTOM</Badge>
                    </div>
                  </div>
                  <div
                    className="category-color-preview"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditClick(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {customIncome.length === 0 && systemIncome.length === 0 && (
          <div className="empty-categories">
            <div className="empty-categories-icon">💰</div>
            <p>No income categories yet</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="label">Category Name *</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={editForm.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Type *</label>
                <div className="category-type-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value={CategoryType.EXPENSE}
                      checked={editForm.type === CategoryType.EXPENSE}
                      onChange={(e) => handleEditTypeChange(e.target.value)}
                    />
                    <span>Expense</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="type"
                      value={CategoryType.INCOME}
                      checked={editForm.type === CategoryType.INCOME}
                      onChange={(e) => handleEditTypeChange(e.target.value)}
                    />
                    <span>Income</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="label">Icon</label>
                <div className="icon-picker">
                  {CategoryIcons.map((icon) => (
                    <div
                      key={icon}
                      className={`icon-option ${
                        editForm.icon === icon ? "selected" : ""
                      }`}
                      onClick={() => handleEditIconSelect(icon)}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Color</label>
                <div className="color-picker">
                  {CategoryColors.map((color) => (
                    <div
                      key={color}
                      className={`color-option ${
                        editForm.color === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleEditColorSelect(color)}
                    >
                      ✓
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
