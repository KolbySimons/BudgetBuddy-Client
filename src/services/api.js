import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7001/api",
  withCredentials: true, // CRITICAL: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling API responses
api.interceptors.response.use(
  (response) => {
    // Return the data from the standard API response format
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || "An error occurred";
      const errors = error.response.data?.errors || [];

      // If unauthorized, redirect to login (but not if already on login page)
      if (
        error.response.status === 401 &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }

      return Promise.reject({
        message: errorMessage,
        errors: errors,
        status: error.response.status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: "Network error. Please check your connection.",
        errors: [],
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message,
        errors: [],
      });
    }
  }
);

export default api;
