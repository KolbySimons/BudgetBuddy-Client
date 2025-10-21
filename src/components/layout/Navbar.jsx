import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import "../../styles/Navbar.css";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // ProtectedRoute will automatically redirect to /login when user becomes null
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.userName) {
      return user.userName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="layout-navbar">
      <nav className="navbar">
        <div className="navbar-left">
          <button className="sidebar-toggle" onClick={onToggleSidebar}>
            <FaBars />
          </button>
          <h1 className="navbar-title">BudgetBuddy</h1>
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <div className="navbar-user-avatar">{getInitials()}</div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">
                {user?.displayName || user?.userName}
              </span>
              <span className="navbar-user-email">{user?.email}</span>
            </div>
          </div>

          <button className="navbar-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
