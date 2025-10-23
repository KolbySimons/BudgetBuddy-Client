import { NavLink } from "react-router-dom";
import { FaHome, FaWallet, FaExchangeAlt, FaTags } from "react-icons/fa";
import "../../styles/Sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      path: "/dashboard",
      icon: <FaHome />,
      label: "Dashboard",
    },
    {
      path: "/budgets",
      icon: <FaWallet />,
      label: "Budgets",
    },
    {
      path: "/transactions",
      icon: <FaExchangeAlt />,
      label: "Transactions",
    },
    {
      path: "/categories",
      icon: <FaTags />,
      label: "Categories",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <div className="sidebar-brand-logo">
              <img
                src="/logo.PNG"
                alt="BudgetBuddy"
                className="sidebar-logo-image"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="sidebar-nav">
              {navItems.map((item) => (
                <li key={item.path} className="sidebar-nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-link ${isActive ? "active" : ""}`
                    }
                    onClick={onClose}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-text">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="sidebar-footer">
            <p>© 2025 BudgetBuddy</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
