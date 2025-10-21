import api from "./api";

const dashboardService = {
  // Get complete dashboard data
  getDashboard: async () => {
    const response = await api.get("/dashboard");
    return response.data;
  },

  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  // Get spending by category
  getSpendingByCategory: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get("/dashboard/spending-by-category", {
      params,
    });
    return response.data;
  },

  // Get monthly spending trend
  getMonthlyTrend: async (months = 6) => {
    const response = await api.get(`/dashboard/monthly-trend?months=${months}`);
    return response.data;
  },

  // Get budget health
  getBudgetHealth: async () => {
    const response = await api.get("/dashboard/budget-health");
    return response.data;
  },
};

export default dashboardService;
