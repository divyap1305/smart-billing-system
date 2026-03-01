import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadInvoices = async () => {
    const res = await axios.get("http://localhost:5000/api/invoices");
    setInvoices(res.data);
  };

  const searchInvoices = async () => {
    if (search.trim() === "") {
      loadInvoices();
      return;
    }
    const res = await axios.get(`http://localhost:5000/api/invoices/search/${search}`);
    setInvoices(res.data);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoice History</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by Name / Phone / Invoice No"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />

      <button onClick={searchInvoices} style={{ padding: "10px" }}>
        Search
      </button>

      {/* INVOICE LIST */}
      <table style={{ width: "100%", marginTop: "20px" }} border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Total</th>
            <th>Print</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.invoiceNo}</td>
              <td>{inv.customerName}</td>
              <td>{inv.customerPhone}</td>
              <td>{new Date(inv.date).toLocaleDateString()}</td>
              <td>₹ {inv.totalAmount}</td>
              <td>
                <button onClick={() => navigate(`/print-invoice/${inv.invoiceNo}`)}>
                  Reprint
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default InvoiceHistory;