import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import dashboardService from "../services/dashboardService";
import StatsCard from "../components/dashboard/StatsCard";
import ActiveBudgets from "../components/dashboard/ActiveBudgets";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import toast from "react-hot-toast";
import "../styles/Card.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const stats = dashboardData?.stats || {
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
  };

  const activeBudgets = dashboardData?.activeBudgets || [];
  const recentTransactions = dashboardData?.recentTransactions || [];

  return (
    <Layout>
      <div>
        {/* Page Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "var(--gray-800)",
              marginBottom: "0.5rem",
            }}
          >
            Welcome back, {user?.displayName || user?.userName}! 👋
          </h1>
          <p style={{ color: "var(--gray-600)" }}>
            Here's your financial overview
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatsCard
            title="Total Budgeted"
            amount={stats.totalBudgeted}
            color="var(--primary)"
          />
          <StatsCard
            title="Total Spent"
            amount={stats.totalSpent}
            color="var(--danger)"
          />
          <StatsCard
            title="Remaining"
            amount={stats.totalRemaining}
            color="var(--success)"
          />
        </div>

        {/* Active Budgets & Recent Transactions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <ActiveBudgets budgets={activeBudgets} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
