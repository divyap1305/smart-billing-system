import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Divya");

  // Get user from localStorage if available
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) setUserName(user.name);
      } catch (e) {
        console.log("Error parsing user data");
      }
    }
  }, []);

  // Placeholder stats (API integration later)
  const stats = {
    todayInvoices: 24,
    todaySales: "₹1,28,450",
    lastInvoiceNo: "INV-2024-0123",
    totalCustomers: 156
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* Professional Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon">SM</div>
          <div className="software-name">
            <h1>Selvam Motors Billing System</h1>
            <div className="tagline">Professional billing solution for your business</div>
          </div>
        </div>

        <div className="user-section">
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">Administrator</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </div>
      </header>

      {/* Statistics Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>TODAY'S INVOICES</h3>
            <div className="stat-number">{stats.todayInvoices}</div>
            <div className="stat-label">+3 from yesterday</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💰</div>
          <div className="stat-content">
            <h3>TODAY'S SALES</h3>
            <div className="stat-number">{stats.todaySales}</div>
            <div className="stat-label">Revenue today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">📄</div>
          <div className="stat-content">
            <h3>LAST INVOICE</h3>
            <div className="stat-number" style={{ fontSize: "1.4rem" }}>
              {stats.lastInvoiceNo}
            </div>
            <div className="stat-label">Invoice #124</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">👥</div>
          <div className="stat-content">
            <h3>TOTAL CUSTOMERS</h3>
            <div className="stat-number">{stats.totalCustomers}</div>
            <div className="stat-label">Active customers</div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <h2 style={{ 
        fontSize: "1.5rem", 
        fontWeight: "600", 
        color: "#1e293b", 
        marginBottom: "20px",
        marginTop: "10px"
      }}>
        Quick Actions
      </h2>

      <div className="features-grid">
        {/* Create Invoice Card */}
        <div className="feature-card" onClick={() => navigate("/create-invoice")}>
          <div className="feature-icon">➕</div>
          <div className="feature-content">
            <h3>Create Invoice</h3>
            <p>Generate new invoices, add items, and print professional bills for your customers.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        {/* Invoice History Card */}
        <div className="feature-card" onClick={() => navigate("/invoices")}>
          <div className="feature-icon green">📊</div>
          <div className="feature-content">
            <h3>Invoice History</h3>
            <p>View all past invoices, search by date/customer, and reprint any invoice.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        {/* Item Master Card */}
        <div className="feature-card" onClick={() => navigate("/items")}>
          <div className="feature-icon purple">🛠️</div>
          <div className="feature-content">
            <h3>Item Master</h3>
            <p>Manage your inventory, add/edit items, update prices and stock levels.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        {/* Customer Management (Optional) */}
        <div className="feature-card" onClick={() => navigate("/customers")}>
          <div className="feature-icon" style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
            👥
          </div>
          <div className="feature-content">
            <h3>Customer Management</h3>
            <p>Add, edit, and manage all your customers in one place.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        {/* Settings (Optional) */}
        <div className="feature-card" onClick={() => navigate("/settings")}>
          <div className="feature-icon teal">⚙️</div>
          <div className="feature-content">
            <h3>Settings</h3>
            <p>Configure billing preferences, tax rates, company details, and more.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>

        {/* Reports (Optional) */}
        <div className="feature-card" onClick={() => navigate("/reports")}>
          <div className="feature-icon" style={{ background: "linear-gradient(135deg, #6b7280, #4b5563)" }}>
            📈
          </div>
          <div className="feature-content">
            <h3>Reports & Analytics</h3>
            <p>View sales reports, tax summaries, and business performance metrics.</p>
          </div>
          <div className="feature-arrow">→</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;