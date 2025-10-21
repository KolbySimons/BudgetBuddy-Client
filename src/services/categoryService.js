import api from "./api";

const categoryService = {
  // Get all categories
  getAll: async () => {
    const response = await api.get("/categories");
    return response;
  },

  // Get categories by type (0 = Expense, 1 = Income)
  getByType: async (type) => {
    const response = await api.get(`/categories/type/${type}`);
    return response;
  },

  // Get expense categories only
  getExpenses: async () => {
    const response = await api.get("/categories/expenses");
    return response;
  },

  // Get income categories only
  getIncome: async () => {
    const response = await api.get("/categories/income");
    return response;
  },

  // Get system categories
  getSystem: async () => {
    const response = await api.get("/categories/system");
    return response;
  },

  // Get custom categories
  getCustom: async () => {
    const response = await api.get("/categories/custom");
    return response;
  },

  // Get single category by ID
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response;
  },

  // Create new custom category
  create: async (categoryData) => {
    const response = await api.post("/categories", categoryData);
    return response;
  },

  // Update custom category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response;
  },

  // Delete custom category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response;
  },

  // Check if category is in use
  isInUse: async (id) => {
    const response = await api.get(`/categories/${id}/in-use`);
    return response;
  },
};

export default categoryService;
