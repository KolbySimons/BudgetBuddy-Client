import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "../../styles/AuthPage.css";
import "../../styles/Input.css";
import "../../styles/Button.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    firstName: "",
    lastName: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const result = await register(formData);

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
          <h1 className="auth-title">💰 Create Your Account</h1>
          <p className="auth-subtitle">Start managing your budget today</p>
        </div>

        {/* Register Card */}
        <div className="auth-card">
          <h2 className="auth-card-title">Sign Up</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="label">
                Email <span className="label-required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? "input-error" : ""}`}
                placeholder="your@email.com"
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="userName" className="label">
                Username <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`input ${errors.userName ? "input-error" : ""}`}
                placeholder="Choose a username"
              />
              {errors.userName && (
                <p className="error-message">{errors.userName}</p>
              )}
            </div>

            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName" className="label">
                First Name <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`input ${errors.firstName ? "input-error" : ""}`}
                placeholder="Your first name"
              />
              {errors.firstName && (
                <p className="error-message">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label htmlFor="lastName" className="label">
                Last Name <span className="label-required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`input ${errors.lastName ? "input-error" : ""}`}
                placeholder="Your last name"
              />
              {errors.lastName && (
                <p className="error-message">{errors.lastName}</p>
              )}
            </div>

            {/* Display Name (Optional) */}
            <div className="form-group">
              <label htmlFor="displayName" className="label">
                Display Name{" "}
                <span style={{ color: "var(--gray-500)", fontSize: "0.75rem" }}>
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="input"
                placeholder="How should we call you?"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="label">
                Password <span className="label-required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input ${errors.password ? "input-error" : ""}`}
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="label">
                Confirm Password <span className="label-required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input ${
                  errors.confirmPassword ? "input-error" : ""
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-full"
              style={{ marginTop: "var(--spacing-lg)" }}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
