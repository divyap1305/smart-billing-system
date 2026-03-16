import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InvoiceHistory.css";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    revenue: 0,
    pending: 0
  });
  
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/invoices");
      setInvoices(res.data);
      setFilteredInvoices(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const searchInvoices = async () => {
    setLoading(true);
    try {
      if (search.trim() === "") {
        loadInvoices();
        return;
      }
      const res = await axios.get(`http://localhost:5000/api/invoices/search/${search}`);
      setInvoices(res.data);
      setFilteredInvoices(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error("Error searching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    const todayInvoices = data.filter(inv => 
      new Date(inv.date).toDateString() === today
    );
    
    const totalRevenue = data.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const pendingAmount = data.reduce((sum, inv) => 
      inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Partial' 
        ? sum + (inv.pendingAmount || inv.totalAmount || 0) 
        : sum, 0
    );

    setStats({
      total: data.length,
      today: todayInvoices.length,
      revenue: totalRevenue,
      pending: pendingAmount
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchInvoices();
    }
  };

  const resetSearch = () => {
    setSearch("");
    loadInvoices();
    setDateFilter("all");
    setPaymentFilter("all");
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Date filter
    if (dateFilter !== "all") {
      const today = new Date();
      const filterDate = new Date();
      
      if (dateFilter === "today") {
        filtered = filtered.filter(inv => 
          new Date(inv.date).toDateString() === today.toDateString()
        );
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today.setDate(today.getDate() - 7));
        filtered = filtered.filter(inv => new Date(inv.date) >= weekAgo);
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        filtered = filtered.filter(inv => new Date(inv.date) >= monthAgo);
      }
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter(inv => inv.paymentStatus === paymentFilter);
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, paymentFilter, invoices]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return 'status-badge status-paid';
      case 'Pending': return 'status-badge status-pending';
      case 'Partial': return 'status-badge status-partial';
      default: return 'status-badge';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="invoice-history-container">
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <h1>
            <span>📋</span> Invoice History
          </h1>
          <p>View and manage all your invoices</p>
        </div>
        <div className="header-right">
          <div className="stats-badge">
            <div className="label">Total Invoices</div>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stats-badge">
            <div className="label">Today's Invoices</div>
            <div className="value">{stats.today}</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-title">
          <span>🔍</span> Search Invoices
        </div>
        <div className="search-box">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by customer name, phone, or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button className="search-btn" onClick={searchInvoices}>
            <span>🔍</span> Search
          </button>
          <button className="reset-btn" onClick={resetSearch}>
            <span>🔄</span> Reset
          </button>
        </div>

        {/* Filters */}
        <div className="filters-row">
          <select 
            className="filter-select" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <select 
            className="filter-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div className="loading-spinner"></div>
            <p>Loading invoices...</p>
          </div>
        ) : (
          <table className="invoice-table">
            <thead>
              <tr>
                <th><i>📄</i> Invoice No</th>
                <th><i>👤</i> Customer</th>
                <th><i>📱</i> Phone</th>
                <th><i>📅</i> Date</th>
                <th><i>💰</i> Total</th>
                <th><i>💳</i> Payment</th>
                <th><i>📊</i> Status</th>
                <th><i>⚡</i> Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-results">
                    <div className="no-results-content">
                      <div className="no-results-icon">🔍</div>
                      <h3>No invoices found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentInvoices.map((inv) => (
                  <tr key={inv._id}>
                    <td><strong>#{inv.invoiceNo}</strong></td>
                    <td>{inv.customerName}</td>
                    <td>{inv.customerPhone || '—'}</td>
                    <td>{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                    <td className="amount">{formatCurrency(inv.totalAmount)}</td>
                    <td>
                      <span className="payment-mode">
                        {inv.paymentMode === 'Cash' && '💵 Cash'}
                        {inv.paymentMode === 'Card' && '💳 Card'}
                        {inv.paymentMode === 'UPI' && '📱 UPI'}
                        {inv.paymentMode === 'Credit' && '📝 Credit'}
                        {!inv.paymentMode && '—'}
                      </span>
                    </td>
                    <td>
                      <span className={getPaymentStatusBadge(inv.paymentStatus)}>
                        {inv.paymentStatus || 'Paid'}
                        {inv.pendingAmount > 0 && ` (${formatCurrency(inv.pendingAmount)})`}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="print-btn"
                          onClick={() => navigate(`/print-invoice/${inv.invoiceNo}`)}
                          title="Print Invoice"
                        >
                          🖨️
                        </button>
                        <button
                          className="view-btn"
                          onClick={() => navigate(`/invoice-details/${inv.invoiceNo}`)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredInvoices.length > 0 && (
        <div className="pagination">
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={i}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            →
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>Total Revenue</h4>
            <p>{formatCurrency(stats.revenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h4>Pending Amount</h4>
            <p>{formatCurrency(stats.pending)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>Average per Invoice</h4>
            <p>{formatCurrency(stats.total ? stats.revenue / stats.total : 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceHistory;