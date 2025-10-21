import api from "./api";

const budgetService = {
  // Get all budgets
  getAll: async () => {
    const response = await api.get("/budgets");
    return response.data;
  },

  // Get active budgets
  getActive: async () => {
    const response = await api.get("/budgets/active");
    return response.data;
  },

  // Get single budget by ID
  getById: async (id) => {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  // Get budget with visualization data
  getVisualization: async (id) => {
    const response = await api.get(`/budgets/${id}/visualization`);
    return response.data;
  },

  // Create new budget
  create: async (budgetData) => {
    const response = await api.post("/budgets", budgetData);
    return response.data;
  },

  // Update budget
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete budget
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },

  // Recalculate spent amounts
  recalculate: async (id) => {
    const response = await api.post(`/budgets/${id}/recalculate`);
    return response.data;
  },
};

export default budgetService;
