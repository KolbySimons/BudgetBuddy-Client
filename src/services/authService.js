import api from "./api";

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response; // API interceptor already returns response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response; // API interceptor already returns response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response; // API interceptor already returns response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response; // API interceptor already returns response.data
  },
};

export default authService;
