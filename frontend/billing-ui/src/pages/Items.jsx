import { useState, useEffect } from "react";
import axios from "axios";
import "./Items.css";

function Items() {
  // Form states
  const [itemName, setItemName] = useState("");
  const [itemRate, setItemRate] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [gst, setGst] = useState("18");
  const [hsnCode, setHsnCode] = useState("");
  const [description, setDescription] = useState("");
  const [reorderLevel, setReorderLevel] = useState("5");

  // UI states
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});

  // Categories list
  const categories = [
    "Brakes",
    "Filters",
    "Lubricants",
    "Electrical",
    "Engine Parts",
    "Transmission",
    "Accessories",
    "Cooling System",
    "Exhaust",
    "Suspension",
    "Steering",
    "Body Parts"
  ];

  const itemsPerPage = 10;

  // Fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/items");
      setItems(res.data);
      setFilteredItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items based on search and filters
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.hsnCode && item.hsnCode.includes(searchTerm))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(item => (item.stock || 0) <= (item.reorderLevel || 5));
    } else if (stockFilter === "out") {
      filtered = filtered.filter(item => (item.stock || 0) === 0);
    } else if (stockFilter === "in") {
      filtered = filtered.filter(item => (item.stock || 0) > (item.reorderLevel || 5));
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter, items]);

  // Statistics
  const stats = {
    total: items.length,
    lowStock: items.filter(item => (item.stock || 0) <= (item.reorderLevel || 5)).length,
    outOfStock: items.filter(item => (item.stock || 0) === 0).length,
    totalValue: items.reduce((sum, item) => sum + ((item.stock || 0) * (item.defaultRate || 0)), 0)
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!itemName.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!itemRate || itemRate <= 0) {
      newErrors.rate = "Valid rate is required";
    }

    if (stock !== "" && stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    // Check for duplicate name (if adding new item)
    if (!editingItem) {
      const duplicate = items.find(item => 
        item.name.toLowerCase() === itemName.trim().toLowerCase()
      );
      if (duplicate) {
        newErrors.name = "Item with this name already exists";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add item
  const addItem = async () => {
    if (!validateForm()) return;

    try {
      const newItem = {
        name: itemName.trim(),
        defaultRate: Number(itemRate),
        itemCode: itemCode.trim() || generateItemCode(),
        category: category || "Uncategorized",
        stock: stock ? Number(stock) : 0,
        gst: Number(gst),
        hsnCode: hsnCode.trim() || "",
        description: description.trim() || "",
        reorderLevel: Number(reorderLevel)
      };

      await axios.post("http://localhost:5000/api/items", newItem);
      alert("✅ Item added successfully!");
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding item");
    }
  };

  // Update item
  const updateItem = async () => {
    if (!validateForm()) return;

    try {
      const updatedItem = {
        name: itemName.trim(),
        defaultRate: Number(itemRate),
        itemCode: itemCode.trim() || editingItem.itemCode,
        category: category || editingItem.category,
        stock: stock !== "" ? Number(stock) : editingItem.stock || 0,
        gst: Number(gst),
        hsnCode: hsnCode.trim() || editingItem.hsnCode,
        description: description.trim() || editingItem.description,
        reorderLevel: Number(reorderLevel)
      };

      await axios.put(`http://localhost:5000/api/items/${editingItem._id}`, updatedItem);
      alert("✅ Item updated successfully!");
      resetForm();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating item");
    }
  };

  // Delete item
  const deleteItem = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/items/${id}`);
        alert("✅ Item deleted successfully!");
        fetchItems();
      } catch (err) {
        alert("Error deleting item");
      }
    }
  };

  // Copy item (quick add similar)
  const copyItem = (item) => {
    setEditingItem(null);
    setItemName(item.name + " (Copy)");
    setItemRate(item.defaultRate);
    setItemCode(item.itemCode ? item.itemCode + "-COPY" : "");
    setCategory(item.category || "");
    setStock(item.stock || 0);
    setGst(item.gst || 18);
    setHsnCode(item.hsnCode || "");
    setDescription(item.description || "");
    setReorderLevel(item.reorderLevel || 5);
    setShowModal(true);
  };

  // Edit item
  const editItem = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemRate(item.defaultRate);
    setItemCode(item.itemCode || "");
    setCategory(item.category || "");
    setStock(item.stock || 0);
    setGst(item.gst || 18);
    setHsnCode(item.hsnCode || "");
    setDescription(item.description || "");
    setReorderLevel(item.reorderLevel || 5);
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setItemName("");
    setItemRate("");
    setItemCode("");
    setCategory("");
    setStock("");
    setGst("18");
    setHsnCode("");
    setDescription("");
    setReorderLevel("5");
    setEditingItem(null);
    setErrors({});
    setShowModal(false);
  };

  // Generate item code
  const generateItemCode = () => {
    const prefix = category ? category.substring(0, 3).toUpperCase() : "ITM";
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${random}`;
  };

  // Get stock status
  const getStockStatus = (item) => {
    const currentStock = item.stock || 0;
    const reorder = item.reorderLevel || 5;

    if (currentStock === 0) {
      return { class: "stock-low", text: "🔴 Out of Stock", icon: "❌" };
    } else if (currentStock <= reorder) {
      return { class: "stock-medium", text: `🟡 Low Stock (${currentStock})`, icon: "⚠️" };
    } else {
      return { class: "stock-high", text: `🟢 In Stock (${currentStock})`, icon: "✅" };
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="items-container">
      {/* Header */}
      <div className="items-header">
        <div className="header-left">
          <h1>
            <span>📦</span> Item Master
          </h1>
          <p>Manage your inventory and item catalog</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <span>➕</span> Add New Item
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Items</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <p>{stats.lowStock}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">❌</div>
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <p>{stats.outOfStock}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Inventory Value</h3>
            <p>₹{stats.totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, code, or HSN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <button className="clear-filters" onClick={() => {
            setSearchTerm("");
            setCategoryFilter("all");
            setStockFilter("all");
          }}>
            <span>🔄</span> Clear
          </button>
        </div>

        <div className="quick-filters">
          <button 
            className={`quick-filter-btn ${categoryFilter === "all" && "active"}`}
            onClick={() => setCategoryFilter("all")}
          >
            All
          </button>
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              className={`quick-filter-btn ${categoryFilter === cat && "active"}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span>{editingItem ? "✏️" : "➕"}</span>
                {editingItem ? " Edit Item" : " Add New Item"}
              </h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              editingItem ? updateItem() : addItem();
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="required">Item Name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Brake Pad"
                    className={errors.name ? "error" : ""}
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label>Item Code/SKU</label>
                  <input
                    type="text"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="required">Rate (₹)</label>
                  <input
                    type="number"
                    value={itemRate}
                    onChange={(e) => setItemRate(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={errors.rate ? "error" : ""}
                  />
                  {errors.rate && <div className="error-message">{errors.rate}</div>}
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="5"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GST (%)</label>
                  <select value={gst} onChange={(e) => setGst(e.target.value)}>
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>HSN Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g., 8708"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter item description..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingItem ? "Update Item" : "Save Item"}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : (
          <table className="items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Rate (₹)</th>
                <th>GST</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-results">
                    <div className="no-results-content">
                      <div className="no-results-icon">🔍</div>
                      <h3>No items found</h3>
                      <p>Try adjusting your search or add a new item</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td><strong>{item.itemCode || '—'}</strong></td>
                      <td>{item.name}</td>
                      <td>
                        <span className="category-badge">
                          {item.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td><strong>₹{item.defaultRate}</strong></td>
                      <td>{item.gst || 18}%</td>
                      <td>{item.stock || 0}</td>
                      <td>
                        <span className={`stock-badge ${stockStatus.class}`}>
                          {stockStatus.icon} {stockStatus.text}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => editItem(item)}
                            title="Edit Item"
                          >
                            ✏️
                          </button>
                          <button
                            className="copy-btn"
                            onClick={() => copyItem(item)}
                            title="Copy Item"
                          >
                            📋
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteItem(item._id, item.name)}
                            title="Delete Item"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filteredItems.length > 0 && (
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
    </div>
  );
}

export default Items;