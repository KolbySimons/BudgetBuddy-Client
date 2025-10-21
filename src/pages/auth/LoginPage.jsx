import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/AuthPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const result = await login(formData);

    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">💰 BudgetBuddy</h1>
          <p className="auth-subtitle">
            Plan your budget. Visualize your progress.
          </p>
        </div>

        {/* Login Card */}
        <div className="auth-card">
          <h2 className="auth-card-title">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email or Username */}
            <div className="form-group">
              <label htmlFor="emailOrUsername" className="label">
                Email or Username
              </label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleChange}
                className={`input ${
                  errors.emailOrUsername ? "input-error" : ""
                }`}
                placeholder="Enter your email or username"
              />
              {errors.emailOrUsername && (
                <p className="error-message">{errors.emailOrUsername}</p>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="checkbox"
              />
              <label htmlFor="rememberMe" className="checkbox-label">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Register Link */}
          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
