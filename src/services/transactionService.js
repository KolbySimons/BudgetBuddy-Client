import api from "./api";

const transactionService = {
  // Get all transactions
  getAll: async () => {
    const response = await api.get("/transactions");
    return response; // API interceptor already returns response.data
  },

  // Get recent transactions
  getRecent: async (count = 10) => {
    const response = await api.get(`/transactions/recent?count=${count}`);
    return response; // API interceptor already returns response.data
  },

  // Get filtered transactions
  getFiltered: async (filters) => {
    const response = await api.post("/transactions/filter", filters);
    return response; // API interceptor already returns response.data
  },

  // Get transactions by date range
  getByDateRange: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get("/transactions/date-range", { params });
    return response; // API interceptor already returns response.data
  },

  // Get single transaction by ID
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response; // API interceptor already returns response.data
  },

  // Create new transaction
  create: async (transactionData) => {
    const response = await api.post("/transactions", transactionData);
    return response; // API interceptor already returns response.data
  },

  // Update transaction
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response; // API interceptor already returns response.data
  },

  // Delete transaction
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response; // API interceptor already returns response.data
  },

  // Get transaction statistics
  getStats: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get("/transactions/stats", { params });
    return response; // API interceptor already returns response.data
  },
};

export default transactionService;
