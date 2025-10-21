import api from "./api";

const budgetService = {
  // Get all budgets
  getAll: async () => {
    const response = await api.get("/budgets");
    return response; // API interceptor already returns response.data
  },

  // Get active budgets
  getActive: async () => {
    const response = await api.get("/budgets/active");
    return response; // API interceptor already returns response.data
  },

  // Get single budget by ID
  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response; // API interceptor already returns response.data
  },

  // Get budget with visualization data
  getVisualization: async (id) => {
    // Add cache-busting parameter to ensure fresh data
    const timestamp = new Date().getTime();
    const response = await api.get(
      `/budgets/${id}/visualization?_t=${timestamp}`
    );
    return response; // API interceptor already returns response.data
  },

  // Create new budget
  create: async (budgetData) => {
    const response = await api.post("/budgets", budgetData);
    return response; // API interceptor already returns response.data
  },

  // Update budget
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response; // API interceptor already returns response.data
  },

  // Delete budget
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response; // API interceptor already returns response.data
  },

  // Recalculate spent amounts
  recalculate: async (id) => {
    const response = await api.post(`/budgets/${id}/recalculate`);
    return response; // API interceptor already returns response.data
  },
};

export default budgetService;
