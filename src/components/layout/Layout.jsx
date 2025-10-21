import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../../styles/Layout.css";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="layout-main">
        <Navbar onToggleSidebar={toggleSidebar} />

        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
