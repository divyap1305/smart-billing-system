import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./CreateInvoice.css";

function CreateInvoice() {
  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  // Invoice Items
  const [items, setItems] = useState([
    { id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 }
  ]);

  // Available items from database
  const [availableItems, setAvailableItems] = useState([]);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(-1);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [searchText, setSearchText] = useState("");

  // Invoice Metadata
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [gst, setGst] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Refs
  const itemInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch last invoice number and available items
  useEffect(() => {
    axios.get("http://localhost:5000/api/invoices")
      .then(res => {
        if (res.data.length > 0) {
          const latest = Math.max(...res.data.map(inv => inv.invoiceNo));
          setInvoiceNo(latest + 1);
        }
      })
      .catch(err => console.log("Error fetching invoices:", err));

    fetchAvailableItems();
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchAvailableItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/items");
      setAvailableItems(res.data);
      console.log("✅ Items loaded:", res.data.length);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Search customer by phone
  const searchCustomerByPhone = async (phone) => {
    if (phone.length !== 10) return;
    
    try {
      const res = await axios.get(`http://localhost:5000/api/customers/search/${phone}`);
      if (res.data) {
        setSelectedCustomer(res.data);
        setCustomerName(res.data.name);
        setCustomerAddress(res.data.address || "");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setSelectedCustomer(null);
      }
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const gstAmount = gst ? (subtotal * Number(gst) / 100) : 0;
  const grandTotal = subtotal + gstAmount;

  const formatAmount = (amount) => (amount || 0).toFixed(2);

  // Add new item row
  const addItem = () => {
    const newItem = { 
      id: Date.now(), 
      name: "", 
      qty: 1, 
      rate: 0, 
      amount: 0
    };
    setItems([...items, newItem]);
    setCurrentItemIndex(items.length);
    setSearchText("");
    
    setTimeout(() => {
      if (itemInputRef.current) {
        itemInputRef.current.focus();
      }
    }, 100);
  };

  // Handle item search - PROFESSIONAL DROPDOWN
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.length >= 1) {
      const filtered = availableItems.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setDropdownItems(filtered);
      setShowDropdown(true);
      setActiveDropdownIndex(-1);
    } else {
      setShowDropdown(false);
      setDropdownItems([]);
    }

    // Clear current item if typing
    const updated = [...items];
    updated[currentItemIndex].name = "";
    updated[currentItemIndex].rate = 0;
    updated[currentItemIndex].amount = 0;
    setItems(updated);
  };

  // Handle item select
  const handleItemSelect = (selectedItem) => {
    const updated = [...items];
    updated[currentItemIndex].name = selectedItem.name;
    updated[currentItemIndex].rate = selectedItem.defaultRate;
    updated[currentItemIndex].amount = updated[currentItemIndex].qty * selectedItem.defaultRate;
    setItems(updated);
    
    setSearchText(selectedItem.name);
    setShowDropdown(false);
    
    // Clear error
    if (errors[`item-${currentItemIndex}-name`]) {
      const newErrors = { ...errors };
      delete newErrors[`item-${currentItemIndex}-name`];
      setErrors(newErrors);
    }
    
    // Focus quantity field
    setTimeout(() => {
      const qtyInput = document.getElementById(`qty-${currentItemIndex}`);
      if (qtyInput) qtyInput.focus();
    }, 100);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveDropdownIndex(prev => 
        prev < dropdownItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveDropdownIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeDropdownIndex >= 0) {
        handleItemSelect(dropdownItems[activeDropdownIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Handle row click to set current index
  const handleRowClick = (index) => {
    setCurrentItemIndex(index);
    setSearchText(items[index].name);
  };

  // Update item
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "qty") {
      updated[index].amount = updated[index].qty * updated[index].rate;
    }
    setItems(updated);
    
    if (errors[`item-${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`item-${index}-${field}`];
      setErrors(newErrors);
    }
  };

  // Delete item
  const deleteItem = (index) => {
    if (items.length === 1) {
      setErrors({ ...errors, general: "At least one item is required" });
      return;
    }
    
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    
    if (currentItemIndex === index) {
      setCurrentItemIndex(0);
      setSearchText(updated[0]?.name || "");
    } else if (currentItemIndex > index) {
      setCurrentItemIndex(prev => prev - 1);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    let hasValidItem = false;
    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item-${index}-name`] = "Please select an item";
      } else {
        hasValidItem = true;
      }
      if (item.qty <= 0) {
        newErrors[`item-${index}-qty`] = "Qty must be > 0";
      }
    });

    if (!hasValidItem) {
      newErrors.items = "At least one item is required";
    }

    if (grandTotal <= 0) {
      newErrors.total = "Total amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save invoice
  const saveInvoice = async () => {
    if (!validateForm()) {
      alert("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        invoiceNo,
        customerId: selectedCustomer?._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items: items.map(({ id, ...item }) => item),
        gst: Number(gst) || 0,
        gstAmount,
        notes: notes.trim(),
        totalAmount: grandTotal,
        paymentMode,
        paidAmount: paidAmount ? Number(paidAmount) : grandTotal
      };

      const res = await axios.post("http://localhost:5000/api/invoices", payload);
      alert("✅ Invoice Saved Successfully!");
      window.location.href = `/print-invoice/${res.data.invoice.invoiceNo}`;

    } catch (err) {
      alert("❌ Error saving invoice: " + (err.response?.data?.message || "Server error"));
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form
  const resetForm = () => {
    if (window.confirm("Clear all invoice data?")) {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setSelectedCustomer(null);
      setItems([{ id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 }]);
      setSearchText("");
      setShowDropdown(false);
      setGst("");
      setNotes("");
      setPaymentMode("Cash");
      setPaidAmount("");
      setErrors({});
      setCurrentItemIndex(0);
    }
  };

  return (
    <div className="invoice-container">
      {/* Header */}
      <header className="invoice-header">
        <div className="header-left">
          <div className="header-icon">📄</div>
          <div className="header-title">
            <h1>Create New Invoice</h1>
            <div className="subtitle">Enter billing details below</div>
          </div>
        </div>
        <div className="header-info">
          <div className="info-box">
            <div className="info-label">Invoice No.</div>
            <div className="info-value">#{invoiceNo}</div>
          </div>
          <div className="info-box">
            <div className="info-label">Date</div>
            <div className="info-value small">
              {new Date().toLocaleDateString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Customer Details */}
      <div className="section-card">
        <div className="section-title"><span>👤</span> Customer Details</div>
        <div className="customer-grid">
          <div className="form-group">
            <label className="required">Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); }}
              className={errors.customerName ? "error" : ""}
              onBlur={() => setTouched({ ...touched, customerName: true })}
            />
            {errors.customerName && touched.customerName && (
              <div className="error-message">{errors.customerName}</div>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(e) => { 
                setCustomerPhone(e.target.value); 
                if (e.target.value.length === 10) searchCustomerByPhone(e.target.value);
              }}
            />
            {selectedCustomer && (
              <small className="customer-found">✓ Existing customer: {selectedCustomer.name}</small>
            )}
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Enter address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="section-card">
        <div className="section-title"><span>🛒</span> Invoice Items</div>
        <div className="table-container">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Description</th>
                <th style={{ width: "100px" }}>Quantity</th>
                <th style={{ width: "120px" }}>Rate (₹)</th>
                <th style={{ width: "120px" }}>Amount (₹)</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleRowClick(index)}
                  style={{ cursor: 'pointer', background: currentItemIndex === index ? '#f0f9ff' : 'white' }}
                >
                  <td className="sno-cell">{index + 1}</td>
<td style={{ position: 'relative' }}>
  <div className="dropdown-container">
    <input
      ref={itemInputRef}
      type="text"
      className="dropdown-input"
      placeholder="Type to search items..."
      value={searchText}
      onChange={handleSearchChange}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (searchText.length >= 1) {
          const filtered = availableItems.filter(item => 
            item.name.toLowerCase().includes(searchText.toLowerCase())
          );
          setDropdownItems(filtered);
          setShowDropdown(filtered.length > 0);
        }
      }}
      autoComplete="off"
    />
    
    {/* Dropdown Menu */}
    {showDropdown && dropdownItems.length > 0 && (
      <div className="dropdown-menu">
        {dropdownItems.map((item, i) => (
          <div
            key={item._id}
            className={`dropdown-item ${i === activeDropdownIndex ? 'active' : ''}`}
            onClick={() => {
              handleItemSelect(item);
              setShowDropdown(false);
            }}
            onMouseEnter={() => setActiveDropdownIndex(i)}
          >
            <span className="dropdown-item-name">{item.name}</span>
            <span className="dropdown-item-rate">₹{item.defaultRate}</span>
          </div>
        ))}
      </div>
    )}
    
    {/* No Results */}
    {showDropdown && dropdownItems.length === 0 && (
      <div className="dropdown-empty">
        No items found. Add in Item Master first.
      </div>
    )}
  </div>
  
  {/* Error Message */}
  {errors[`item-${currentItemIndex}-name`] && (
    <div className="error-message">{errors[`item-${currentItemIndex}-name`]}</div>
  )}
</td>
                  
                  <td>
                    <input
                      id={`qty-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.qty}
                      onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
                      className={errors[`item-${index}-qty`] ? "error" : ""}
                      disabled={!item.name}
                      style={{ width: '100%' }}
                    />
                  </td>
                  
                  <td>
                    <input
                      id={`rate-${index}`}
                      type="number"
                      value={item.rate}
                      readOnly
                      className={errors[`item-${index}-rate`] ? "error" : ""}
                      style={{ 
                        background: "#f1f5f9", 
                        cursor: "not-allowed",
                        color: "#1e293b",
                        fontWeight: "500",
                        width: '100%'
                      }}
                    />
                  </td>
                  
                  <td className="amount-cell">₹ {item.amount.toFixed(2)}</td>
                  
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(index);
                      }} 
                      title="Delete item"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="btn-add-row" onClick={addItem}><span>➕</span> Add New Row</button>
        {errors.items && <div className="error-message" style={{ marginTop: "10px", textAlign: "center" }}>{errors.items}</div>}
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="notes-section">
          <div className="section-title"><span>📝</span> Additional Notes</div>
          <textarea 
            placeholder="Enter any notes or comments for this invoice..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </div>

        <div className="totals-box">
          <div className="section-title" style={{ marginBottom: "15px" }}><span>💰</span> Invoice Summary</div>
          
          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">₹ {formatAmount(subtotal)}</span>
          </div>

          {/* GST Input */}
          <div className="calculation-row">
            <div className="calculation-input">
              <label>GST (%):</label>
              <input
                type="number"
                min="0"
                max="28"
                step="0.1"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                placeholder="Enter GST"
                style={{ width: "100px", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
              />
            </div>
          </div>

          {gstAmount > 0 && (
            <div className="total-row">
              <span className="total-label">GST Amount:</span>
              <span className="total-value">+ ₹ {formatAmount(gstAmount)}</span>
            </div>
          )}

          <div className="total-row grand-total">
            <span className="total-label">Grand Total:</span>
            <span className="total-value">₹ {formatAmount(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <h4>Payment Details</h4>
        <div className="payment-mode">
          <label>Payment Mode:</label>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {paymentMode === 'Credit' && selectedCustomer && (
          <div className="credit-info">
            <p><strong>Credit Limit:</strong> ₹{formatAmount(selectedCustomer.creditLimit)}</p>
            <p><strong>Outstanding:</strong> ₹{formatAmount(selectedCustomer.outstandingBalance)}</p>
            <p><strong>Available:</strong> ₹{formatAmount((selectedCustomer.creditLimit || 0) - (selectedCustomer.outstandingBalance || 0))}</p>
            {grandTotal > ((selectedCustomer.creditLimit || 0) - (selectedCustomer.outstandingBalance || 0)) && (
              <div style={{ color: '#dc2626', marginTop: '10px', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                ⚠️ Warning: This exceeds available credit!
              </div>
            )}
          </div>
        )}

        {paymentMode === 'Credit' && !selectedCustomer && (
          <div className="credit-info warning"><p>⚠️ Please search and select a customer first</p></div>
        )}

        <div className="paid-amount">
          <label>Amount Paid:</label>
          <input 
            type="number" 
            value={paidAmount} 
            onChange={(e) => setPaidAmount(e.target.value)} 
            placeholder="Enter paid amount" 
            min="0" 
            max={grandTotal} 
            step="0.01" 
          />
          <small>Leave empty for full payment (₹{formatAmount(grandTotal)})</small>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-back" onClick={() => window.history.back()}><span>←</span> Back</button>
        <button className="btn-secondary" onClick={resetForm}><span>🔄</span> Reset</button>
        <button className="btn-primary" onClick={saveInvoice} disabled={isSaving}>
          {isSaving ? <>⏳ Saving...</> : <>💾 Save Invoice</>}
        </button>
      </div>
    </div>
  );
}

export default CreateInvoice;