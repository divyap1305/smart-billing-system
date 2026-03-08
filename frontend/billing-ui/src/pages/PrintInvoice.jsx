import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./PrintInvoice.css"; // ✅ Import the CSS

function PrintInvoice() {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/invoices/${invoiceNo}`)
      .then(res => setInvoice(res.data));
  }, [invoiceNo]);

  if (!invoice) return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      Loading invoice...
    </div>
  );

  return (
    <div className="print-container">
      
      {/* Header with Back Button */}
      <div className="print-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <span>←</span> Back
        </button>
        <button className="print-btn" onClick={() => window.print()}>
          🖨️ Print Invoice
        </button>
      </div>
      
      {/* Invoice Paper */}
      <div className="invoice-paper">
        
        {/* COMPANY HEADER */}
        <div className="company-header">
          <h2 className="company-name">SELVAM ELECTRICALS</h2>
          <h3 className="company-subname">SELVAM MOTORS SERVICE CENTRE</h3>
          <p className="company-address">1/500, Kumaramangalam, Junction</p>
          <p className="company-address">Tiruchengode (Tk), Namakkal (Dt) - 637205</p>
          <p className="company-contact">Sales: 94894 83084 | Service: 99526 62809</p>
          <p className="company-gst">GSTIN: 33EKJPS9727P1Z3</p>
        </div>

        {/* QUOTATION HEADER */}
        <div className="quotation-header">
          <div className="quotation-title">QUOTATION</div>
          <div className="quotation-date">Date: {new Date(invoice.date).toLocaleDateString()}</div>
          <div className="quotation-no">No: {invoice.invoiceNo}</div>
        </div>

        {/* CUSTOMER BOX */}
        <div className="customer-box">
          <div className="customer-value">
            <span className="customer-label">M/s:</span> {invoice.customerName}
          </div>
          <div className="customer-value">
            <span className="customer-label">Phone:</span> {invoice.customerPhone}
          </div>
          <div className="customer-value">
            <span className="customer-label">Address:</span> {invoice.customerAddress}
          </div>
        </div>

        {/* TABLE */}
        <table className="items-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description of Goods</th>
              <th>Qty</th>
              <th>Rate (Rs)</th>
              <th>Amount (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="sno-cell">{index + 1}</td>
                <td className="description-cell">{item.name}</td>
                <td className="qty-cell">{item.qty}</td>
                <td className="rate-cell">{item.rate}</td>
                <td className="amount-cell">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTAL SECTION */}
        <div className="totals-section">
          <div className="totals-box">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span className="total-value">₹{invoice.subtotal || invoice.totalAmount}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="total-row">
                <span className="total-label">Discount:</span>
                <span className="total-value">-₹{invoice.discount}</span>
              </div>
            )}
            {invoice.gst > 0 && (
              <div className="total-row">
                <span className="total-label">GST ({invoice.gst}%):</span>
                <span className="total-value">₹{invoice.gstAmount}</span>
              </div>
            )}
            <div className="total-row grand-total-row">
              <span className="grand-total-label">Grand Total:</span>
              <span className="grand-total-value">₹{invoice.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="invoice-footer">
          <div className="thankyou-message">Thank you for your business!</div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-text">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrintInvoice;