import { useState, useEffect } from "react";
import axios from "axios";
import "./Reports.css";

function Reports() {
  const [activeReport, setActiveReport] = useState("daily");
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Sample data - Replace with actual API calls
  const generateReport = async () => {
    setLoading(true);
    
    try {
      // Fetch invoices
      const res = await axios.get("http://localhost:5000/api/invoices");
      const invoices = res.data;
      
      // Filter by date
      const filtered = invoices.filter(inv => {
        const invDate = new Date(inv.date).toISOString().slice(0, 10);
        return invDate >= dateRange.from && invDate <= dateRange.to;
      });

      // Calculate statistics
      const totalInvoices = filtered.length;
      const totalAmount = filtered.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = filtered.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
      const totalPending = filtered.reduce((sum, inv) => sum + (inv.pendingAmount || 0), 0);
      
      // Payment mode breakdown
      const paymentModes = {
        Cash: filtered.filter(inv => inv.paymentMode === 'Cash').length,
        Card: filtered.filter(inv => inv.paymentMode === 'Card').length,
        UPI: filtered.filter(inv => inv.paymentMode === 'UPI').length,
        Credit: filtered.filter(inv => inv.paymentMode === 'Credit').length
      };

      // Top customers
      const customerMap = {};
      filtered.forEach(inv => {
        if (!customerMap[inv.customerName]) {
          customerMap[inv.customerName] = {
            name: inv.customerName,
            count: 0,
            amount: 0
          };
        }
        customerMap[inv.customerName].count++;
        customerMap[inv.customerName].amount += inv.totalAmount;
      });

      const topCustomers = Object.values(customerMap)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setReportData({
        summary: {
          totalInvoices,
          totalAmount,
          totalPaid,
          totalPending,
          averagePerInvoice: totalInvoices ? (totalAmount / totalInvoices).toFixed(2) : 0
        },
        paymentModes,
        topCustomers,
        invoices: filtered
      });

    } catch (err) {
      console.error("Error generating report:", err);
      alert("Error generating report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [activeReport, dateRange.from, dateRange.to]);

  const exportToExcel = () => {
    if (!reportData) return;

    const csv = [
      ['Report', 'Value'],
      ['Total Invoices', reportData.summary.totalInvoices],
      ['Total Amount', reportData.summary.totalAmount],
      ['Total Paid', reportData.summary.totalPaid],
      ['Total Pending', reportData.summary.totalPending],
      [],
      ['Payment Mode', 'Count'],
      ['Cash', reportData.paymentModes.Cash],
      ['Card', reportData.paymentModes.Card],
      ['UPI', reportData.paymentModes.UPI],
      ['Credit', reportData.paymentModes.Credit],
      [],
      ['Top Customers', 'Invoices', 'Amount'],
      ...reportData.topCustomers.map(c => [c.name, c.count, c.amount])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${dateRange.from}-to-${dateRange.to}.csv`;
    a.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="header-left">
          <h1><span>📊</span> Reports & Analytics</h1>
          <p>View business insights and performance metrics</p>
        </div>
        <button className="btn-export" onClick={exportToExcel} disabled={!reportData}>
          <span>📥</span> Export to Excel
        </button>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button 
          className={`tab-btn ${activeReport === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveReport('daily')}
        >
          📅 Daily Report
        </button>
        <button 
          className={`tab-btn ${activeReport === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveReport('payment')}
        >
          💳 Payment Analysis
        </button>
        <button 
          className={`tab-btn ${activeReport === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveReport('customer')}
        >
          👥 Customer Report
        </button>
        <button 
          className={`tab-btn ${activeReport === 'item' ? 'active' : ''}`}
          onClick={() => setActiveReport('item')}
        >
          📦 Item Report
        </button>
      </div>

      {/* Date Range */}
      <div className="date-range">
        <div className="date-input">
          <label>From:</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
          />
        </div>
        <div className="date-input">
          <label>To:</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Generating report...</p>
        </div>
      ) : reportData && (
        <>
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon">📄</div>
              <div className="card-info">
                <h3>Total Invoices</h3>
                <p>{reportData.summary.totalInvoices}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">💰</div>
              <div className="card-info">
                <h3>Total Amount</h3>
                <p>{formatCurrency(reportData.summary.totalAmount)}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">✅</div>
              <div className="card-info">
                <h3>Total Paid</h3>
                <p>{formatCurrency(reportData.summary.totalPaid)}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">⏳</div>
              <div className="card-info">
                <h3>Total Pending</h3>
                <p>{formatCurrency(reportData.summary.totalPending)}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon">📊</div>
              <div className="card-info">
                <h3>Average</h3>
                <p>{formatCurrency(reportData.summary.averagePerInvoice)}</p>
              </div>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          <div className="report-section">
            <h2>Payment Mode Breakdown</h2>
            <div className="payment-grid">
              <div className="payment-item">
                <span className="payment-label">💵 Cash</span>
                <span className="payment-value">{reportData.paymentModes.Cash}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">💳 Card</span>
                <span className="payment-value">{reportData.paymentModes.Card}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">📱 UPI</span>
                <span className="payment-value">{reportData.paymentModes.UPI}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">📝 Credit</span>
                <span className="payment-value">{reportData.paymentModes.Credit}</span>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="report-section">
            <h2>Top Customers</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Invoices</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topCustomers.map((customer, index) => (
                  <tr key={index}>
                    <td>{customer.name}</td>
                    <td>{customer.count}</td>
                    <td>{formatCurrency(customer.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Invoices */}
          <div className="report-section">
            <h2>Recent Invoices</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.invoices.slice(0, 10).map(inv => (
                  <tr key={inv._id}>
                    <td>#{inv.invoiceNo}</td>
                    <td>{new Date(inv.date).toLocaleDateString()}</td>
                    <td>{inv.customerName}</td>
                    <td>{formatCurrency(inv.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${inv.paymentStatus?.toLowerCase()}`}>
                        {inv.paymentStatus || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;