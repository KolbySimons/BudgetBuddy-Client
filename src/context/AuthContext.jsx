import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (isMounted) {
        await checkAuth();
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const newUser = await authService.register(userData);
      setUser(newUser);
      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Registration failed");
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success("Logged out successfully");
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear user state locally
      setUser(null);
      toast.error(error.message || "Logout failed");
      return { success: true }; // Return success since we cleared local state
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
