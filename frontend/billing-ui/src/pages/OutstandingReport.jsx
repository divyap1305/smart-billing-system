import { useState, useEffect } from "react";
import axios from "axios";

function OutstandingReport() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [pendingInvoices, setPendingInvoices] = useState([]);

  useEffect(() => {
    fetchOutstandingCustomers();
  }, []);

  const fetchOutstandingCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers/outstanding/all");
      setCustomers(res.data);
    } catch (err) {
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customerId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/customers/${customerId}/outstanding`);
      setSelectedCustomer(res.data.customer);
      setPendingInvoices(res.data.pendingInvoices);
    } catch (err) {
      alert("Error fetching details");
    }
  };

  const recordPayment = async (invoiceId) => {
    const amount = prompt("Enter payment amount:");
    if (!amount) return;

    try {
      await axios.post(`http://localhost:5000/api/invoices/payment/${invoiceId}`, {
        paymentAmount: Number(amount),
        paymentMode: "Cash"
      });
      alert("Payment recorded!");
      viewCustomerDetails(selectedCustomer._id);
      fetchOutstandingCustomers();
    } catch (err) {
      alert("Error recording payment");
    }
  };

  return (
    <div className="outstanding-container">
      <h1>💰 Outstanding Report</h1>
      
      <div className="summary-card">
        <h3>Total Outstanding: ₹{customers.reduce((sum, c) => sum + c.outstandingBalance, 0)}</h3>
      </div>

      <div className="customers-list">
        <h2>Customers with Dues</h2>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Phone</th>
              <th>Outstanding</th>
              <th>Credit Limit</th>
              <th>Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>₹{c.outstandingBalance}</td>
                <td>₹{c.creditLimit || 0}</td>
                <td>₹{(c.creditLimit || 0) - c.outstandingBalance}</td>
                <td>
                  <button onClick={() => viewCustomerDetails(c._id)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <div className="customer-details">
          <h3>{selectedCustomer.name} - Pending Invoices</h3>
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingInvoices.map(inv => (
                <tr key={inv._id}>
                  <td>{inv.invoiceNo}</td>
                  <td>{new Date(inv.date).toLocaleDateString()}</td>
                  <td>₹{inv.totalAmount}</td>
                  <td>₹{inv.paidAmount}</td>
                  <td>₹{inv.pendingAmount}</td>
                  <td>
                    <button onClick={() => recordPayment(inv._id)}>
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OutstandingReport;