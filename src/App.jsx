import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard Page
import DashboardPage from "./pages/DashboardPage";

// Budget Pages
import BudgetsPage from "./pages/budgets/BudgetsPage";
import CreateBudgetPage from "./pages/budgets/CreateBudgetPage";
import BudgetDetailPage from "./pages/budgets/BudgetDetailsPage";
import EditBudgetPage from "./pages/budgets/EditBudgetPage";

// Category Pages
import CategoriesPage from "./pages/categories/CategoriesPage";

// Transaction Pages
import TransactionsPage from "./pages/transactions/TransactionsPage";
import AddTransactionPage from "./pages/transactions/AddTransactionPage";
import EditTransactionPage from "./pages/transactions/EditTransactionPage";

// Placeholder pages (we'll create these later)
const OldTransactionsPage = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <h1
      style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}
    >
      Transactions Page Coming Soon!
    </h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <Layout>
                  <BudgetsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateBudgetPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditBudgetPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <BudgetDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <TransactionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/add"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddTransactionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditTransactionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <CategoriesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
