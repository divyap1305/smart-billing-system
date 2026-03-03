import { useState, useEffect } from "react";
import axios from "axios";
import "./Customers.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    gstNo: "",
    creditLimit: 0
  });

  // Fetch all customers on page load
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data);
    } catch (err) {
      alert("Error fetching customers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required!");
      return;
    }

    // Phone validation (10 digits)
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit Indian phone number");
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        await axios.put(`http://localhost:5000/api/customers/${editingCustomer._id}`, formData);
        alert("Customer updated successfully!");
      } else {
        // Create new customer
        await axios.post("http://localhost:5000/api/customers", formData);
        alert("Customer added successfully!");
      }
      
      // Reset form and refresh list
      resetForm();
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      email: customer.email || "",
      gstNo: customer.gstNo || "",
      creditLimit: customer.creditLimit || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        alert("Customer deleted successfully!");
        fetchCustomers();
      } catch (err) {
        alert("Error deleting customer");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      address: "",
      email: "",
      gstNo: "",
      creditLimit: 0
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="customers-container">
      {/* Header */}
      <div className="customers-header">
        <div className="header-left">
          <h1>👥 Customer Management</h1>
          <p>Manage your customers and their details</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Customer
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="required">Customer Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="required">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile number"
                  required
                />
                <small>Indian mobile number (starts with 6-9)</small>
              </div>

              <div className="form-group">
                <label className="required">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter address"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label>GST Number</label>
                <input
                  type="text"
                  name="gstNo"
                  value={formData.gstNo}
                  onChange={handleInputChange}
                  placeholder="Enter GST number (optional)"
                />
              </div>

              <div className="form-group">
                <label>Credit Limit (₹)</label>
                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleInputChange}
                  placeholder="Enter credit limit"
                  min="0"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Email</th>
                <th>Total Purchases</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer._id}>
                    <td>{index + 1}</td>
                    <td><strong>{customer.name}</strong></td>
                    <td>{customer.phone}</td>
                    <td>{customer.address || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.totalPurchases || 0}</td>
                    <td>₹{customer.totalSpent?.toFixed(2) || 0}</td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(customer)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(customer._id, customer.name)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p>{customers.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Credit</h3>
            <p>₹{customers.reduce((sum, c) => sum + (c.creditLimit || 0), 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Active Today</h3>
            <p>{customers.filter(c => c.lastPurchase === new Date().toDateString()).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Customers;