import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:7001/api",
  withCredentials: true, // CRITICAL: Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling API responses
api.interceptors.response.use(
  (response) => {
    console.log("API Response Success:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    // Return the data from the standard API response format
    return response.data;
  },
  (error) => {
    console.error("API Response Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
    });
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
