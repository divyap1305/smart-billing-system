import { useState, useEffect } from "react";
import axios from "axios";

function CreateInvoice() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  
  const [items, setItems] = useState([
    { name: "", qty: 1, rate: 0, amount: 0 }
  ]);

  const [invoiceNo, setInvoiceNo] = useState(1);

  // Fetch last invoice number
  useEffect(() => {
    axios.get("http://localhost:5000/api/invoices")
      .then(res => {
        if (res.data.length > 0) {
          const latest = res.data[0].invoiceNo;
          setInvoiceNo(latest + 1);
        } else {
          setInvoiceNo(1);
        }
      });
  }, []);

  const addItem = () => {
    setItems([...items, { name: "", qty: 1, rate: 0, amount: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // auto calculate amount
    updated[index].amount = updated[index].qty * updated[index].rate;

    setItems(updated);
  };

  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const getTotal = () => items.reduce((sum, item) => sum + item.amount, 0);

  const saveInvoice = async () => {
    try {
      const payload = {
        invoiceNo,
        customerName,
        customerPhone,
        customerAddress,
        items,
        totalAmount: getTotal(),
      };

      const res = await axios.post("http://localhost:5000/api/invoices", payload);

      alert("Invoice Saved Successfully!");

      // Use backend invoiceNo to avoid mismatch
      window.location.href = `/print-invoice/${res.data.invoice.invoiceNo}`;

    } catch (err) {
      alert("Error saving invoice");
    }
  };

  return (
    <div style={{ width: "800px", margin: "auto", padding: "20px" }}>
      
      <h2>CREATE INVOICE</h2>

      <div style={{ marginBottom: "20px" }}>
        <p><b>Invoice No:</b> {invoiceNo}</p>
        <p><b>Date:</b> {new Date().toLocaleDateString()}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Customer Details</h3>
        <input 
          type="text" 
          placeholder="Customer Name" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input 
          type="text" 
          placeholder="Customer Phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input 
          type="text" 
          placeholder="Customer Address"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <h3>Items</h3>

      {items.map((item, index) => (
        <div key={index} style={{ display: "flex", marginBottom: "10px", gap: "10px" }}>
          <input
            type="text"
            placeholder="Description"
            value={item.name}
            onChange={(e) => updateItem(index, "name", e.target.value)}
            style={{ flex: 3, padding: "8px" }}
          />

          <input
            type="number"
            value={item.qty}
            onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
            style={{ flex: 1, padding: "8px" }}
          />

          <input
            type="number"
            value={item.rate}
            onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
            style={{ flex: 1, padding: "8px" }}
          />

          <div style={{ flex: 1, padding: "8px", fontWeight: "bold" }}>
            {item.amount}
          </div>

          <button 
            onClick={() => deleteItem(index)}
            style={{ background: "red", color: "white", padding: "5px 10px" }}
          >
            X
          </button>
        </div>
      ))}

      <button onClick={addItem} style={{ padding: "10px", marginTop: "10px" }}>
        + Add Item
      </button>

      <h2 style={{ marginTop: "20px" }}>Total: ₹ {getTotal()}</h2>

      <button 
        onClick={saveInvoice}
        style={{
          padding: "10px 20px",
          background: "green",
          color: "white",
          fontWeight: "bold",
          marginTop: "20px"
        }}
      >
        SAVE INVOICE
      </button>

    </div>
  );
}

export default CreateInvoice;