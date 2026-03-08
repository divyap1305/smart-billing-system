import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ItemSearchDropdown from "../components/ItemSearchDropdown";
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

  // Invoice Metadata
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [discount, setDiscount] = useState({ type: "percent", value: 0 });
  const [gst, setGst] = useState(0);
  const [notes, setNotes] = useState("");
  
  // ✅ Customer and Payment States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [showPayment, setShowPayment] = useState(true);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Refs for focus management
  const itemInputRefs = useRef([]);

  // Fetch last invoice number
  useEffect(() => {
    axios.get("http://localhost:5000/api/invoices")
      .then(res => {
        if (res.data.length > 0) {
          const latest = Math.max(...res.data.map(inv => inv.invoiceNo));
          setInvoiceNo(latest + 1);
        }
      })
      .catch(err => console.log("Error fetching invoices:", err));
  }, []);

  // ✅ Search customer by phone number
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
  
  const discountAmount = discount.type === "percent" 
    ? (subtotal * discount.value) / 100 
    : discount.value;
  
  const gstAmount = (subtotal - discountAmount) * gst / 100;
  const grandTotal = subtotal - discountAmount + gstAmount;

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
    
    setTimeout(() => {
      const lastIndex = items.length;
      if (itemInputRefs.current[lastIndex]) {
        itemInputRefs.current[lastIndex].focus();
      }
    }, 100);
  };

  // Update item
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    
    if (field === "qty" || field === "rate") {
      updated[index].amount = updated[index].qty * updated[index].rate;
    }
    
    setItems(updated);
    clearError(`item-${index}-${field}`);
  };

  // Handle item selection from dropdown
  const handleItemSelect = (index, selectedItem) => {
    const updated = [...items];
    updated[index].name = selectedItem.name;
    updated[index].rate = selectedItem.rate;
    updated[index].amount = updated[index].qty * selectedItem.rate;
    setItems(updated);
    
    setTimeout(() => {
      const qtyInput = document.getElementById(`qty-${index}`);
      if (qtyInput) qtyInput.focus();
    }, 100);
  };

  // Delete item
  const deleteItem = (index) => {
    if (items.length === 1) {
      setErrors({ ...errors, general: "At least one item is required" });
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, index, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      if (field === "rate") {
        addItem();
      } else if (field === "qty") {
        const rateInput = document.getElementById(`rate-${index}`);
        if (rateInput) rateInput.focus();
      }
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    items.forEach((item, index) => {
      if (!item.name.trim()) {
        newErrors[`item-${index}-name`] = "Item name required";
      }
      if (item.qty <= 0) {
        newErrors[`item-${index}-qty`] = "Qty must be > 0";
      }
      if (item.rate < 0) {
        newErrors[`item-${index}-rate`] = "Rate cannot be negative";
      }
    });

    if (grandTotal <= 0) {
      newErrors.total = "Total amount must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // ✅ Save invoice with payment data
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
        discount: discountAmount,
        gst,
        notes: notes.trim(),
        totalAmount: grandTotal,
        paymentMode,
        paidAmount: paidAmount ? Number(paidAmount) : grandTotal
      };

      const res = await axios.post("http://localhost:5000/api/invoices", payload);

      alert("✅ Invoice Saved Successfully!");
      
      window.location.href = `/print-invoice/${res.data.invoice.invoiceNo}`;

    } catch (err) {
      console.error("Save error:", err);
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
      setDiscount({ type: "percent", value: 0 });
      setGst(0);
      setNotes("");
      setPaymentMode("Cash");
      setPaidAmount("");
      setErrors({});
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
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Customer Details */}
      <div className="section-card">
        <div className="section-title">
          <span>👤</span> Customer Details
        </div>
        
        <div className="customer-grid">
          <div className="form-group">
            <label className="required">Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                clearError("customerName");
              }}
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
                searchCustomerByPhone(e.target.value);
              }}
              onBlur={() => searchCustomerByPhone(customerPhone)}
            />
            {selectedCustomer && (
              <small className="customer-found">
                ✓ Existing customer: {selectedCustomer.name}
              </small>
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
        <div className="section-title">
          <span>🛒</span> Invoice Items
        </div>

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
                <tr key={item.id}>
                  <td className="sno-cell">{index + 1}</td>
                  
                  <td>
                    <ItemSearchDropdown
                      value={item.name}
                      onChange={(value) => updateItem(index, "name", value)}
                      onSelect={(selected) => handleItemSelect(index, selected)}
                      onEnter={() => {
                        const qtyInput = document.getElementById(`qty-${index}`);
                        if (qtyInput) qtyInput.focus();
                      }}
                      index={index}
                    />
                    {errors[`item-${index}-name`] && (
                      <div className="error-message">{errors[`item-${index}-name`]}</div>
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
                      onKeyDown={(e) => handleKeyDown(e, index, "qty")}
                      className={errors[`item-${index}-qty`] ? "error" : ""}
                    />
                  </td>
                  
                  <td>
                    <input
                      id={`rate-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
                      onKeyDown={(e) => handleKeyDown(e, index, "rate")}
                      className={errors[`item-${index}-rate`] ? "error" : ""}
                    />
                  </td>
                  
                  <td className="amount-cell">
                    ₹ {item.amount.toFixed(2)}
                  </td>
                  
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => deleteItem(index)}
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

        <button className="btn-add-row" onClick={addItem}>
          <span>➕</span> Add New Row
        </button>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <div className="notes-section">
          <div className="section-title">
            <span>📝</span> Additional Notes
          </div>
          <textarea
            placeholder="Enter any notes or comments for this invoice..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="totals-box">
          <div className="section-title" style={{ marginBottom: "15px" }}>
            <span>💰</span> Invoice Summary
          </div>

          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-value">₹ {subtotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="calculation-row">
            <div className="calculation-input">
              <label>Discount:</label>
              <select
                value={discount.type}
                onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                style={{ width: "70px", padding: "6px", borderRadius: "6px" }}
              >
                <option value="percent">%</option>
                <option value="fixed">₹</option>
              </select>
              <input
                type="number"
                min="0"
                value={discount.value}
                onChange={(e) => setDiscount({ ...discount, value: Number(e.target.value) })}
                style={{ width: "80px" }}
              />
            </div>
          </div>

          {discountAmount > 0 && (
            <div className="total-row">
              <span className="total-label">Discount:</span>
              <span className="total-value">- ₹ {discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* GST */}
          <div className="calculation-row">
            <div className="calculation-input">
              <label>GST (%):</label>
              <input
                type="number"
                min="0"
                max="28"
                step="0.1"
                value={gst}
                onChange={(e) => setGst(Number(e.target.value))}
                style={{ width: "80px" }}
              />
            </div>
          </div>

          {gstAmount > 0 && (
            <div className="total-row">
              <span className="total-label">GST:</span>
              <span className="total-value">+ ₹ {gstAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="total-row grand-total">
            <span className="total-label">Grand Total:</span>
            <span className="total-value">₹ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="payment-section">
        <h4>Payment Details</h4>
        
        <div className="payment-mode">
          <label>Payment Mode:</label>
          <select 
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Credit">Credit</option>
          </select>
        </div>

        {paymentMode === 'Credit' && selectedCustomer && (
          <div className="credit-info">
            <p><strong>Customer Credit Limit:</strong> ₹{selectedCustomer.creditLimit || 0}</p>
            <p><strong>Outstanding:</strong> ₹{selectedCustomer.outstandingBalance || 0}</p>
            <p><strong>Available Credit:</strong> ₹{(selectedCustomer.creditLimit || 0) - (selectedCustomer.outstandingBalance || 0)}</p>
          </div>
        )}

        {paymentMode === 'Credit' && !selectedCustomer && (
          <div className="credit-info warning">
            <p>⚠️ Please search and select a customer first</p>
          </div>
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
          />
          <small>Leave empty for full payment (₹{grandTotal.toFixed(2)})</small>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {/* ✅ BACK BUTTON - Add this before Reset */}
        <button 
          className="btn-back" 
          onClick={() => window.history.back()}
          title="Go back"
        >
          <span>←</span> Back
        </button>
        
        <button className="btn-secondary" onClick={resetForm}>
          <span>🔄</span> Reset
        </button>
        
        <button 
          className="btn-primary" 
          onClick={saveInvoice}
          disabled={isSaving}
        >
          {isSaving ? (
            <>⏳ Saving...</>
          ) : (
            <>💾 Save Invoice</>
          )}
        </button>
      </div>
    </div>
  );
}

export default CreateInvoice;