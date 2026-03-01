import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function PrintInvoice() {
  const { invoiceNo } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/invoices/${invoiceNo}`)
      .then(res => setInvoice(res.data));
  }, [invoiceNo]);

  if (!invoice) return <h2>Loading...</h2>;

  return (
    <div style={{ width: "800px", margin: "auto", padding: "20px", fontFamily: "Times New Roman" }}>
      
      {/* COMPANY HEADER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>SELVAM ELECTRICALS</h2>
        <h3 style={{ margin: 0 }}>SELVAM MOTORS SERVICE CENTRE</h3>
        <p style={{ margin: "4px 0" }}>1/500, Kumaramangalam, Junction</p>
        <p style={{ margin: "4px 0" }}>
          Tiruchengode (Tk), Namakkal (Dt) - 637205
        </p>
        <p style={{ margin: "4px 0" }}>
          Sales: 94894 83084 | Service: 99526 62809
        </p>
        <p style={{ margin: "4px 0" }}>GSTIN: 33EKJPS9727P1Z3</p>
      </div>

      {/* QUOTATION HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        fontWeight: "bold",
        fontSize: "18px"
      }}>
        <div>QUOTATION</div>
        <div>Date: {new Date(invoice.date).toLocaleDateString()}</div>
        <div>No: {invoice.invoiceNo}</div>
      </div>

      {/* CUSTOMER BOX */}
      <div style={{
        border: "1px solid black",
        padding: "10px",
        marginBottom: "20px",
        fontSize: "16px"
      }}>
        <b>M/s:</b> {invoice.customerName} <br />
        <b>Phone:</b> {invoice.customerPhone} <br />
        <b>Address:</b> {invoice.customerAddress}
      </div>

      {/* TABLE HEADER */}
      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th width="10%">S.No</th>
            <th>Description of Goods</th>
            <th width="10%">Qty</th>
            <th width="20%">Rate (Rs)</th>
            <th width="20%">Amount (Rs)</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: "center" }}>{index + 1}</td>
              <td>{item.name}</td>
              <td style={{ textAlign: "center" }}>{item.qty}</td>
              <td style={{ textAlign: "right" }}>{item.rate}</td>
              <td style={{ textAlign: "right" }}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL SECTION */}
      <div style={{
        marginTop: "20px",
        textAlign: "right",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        Total: ₹ {invoice.totalAmount}
      </div>

      {/* PRINT BUTTON */}
      <button
        onClick={() => window.print()}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer"
        }}
        className="no-print"
      >
        🖨 Print Invoice
      </button>

      {/* HIDE BUTTON DURING PRINT */}
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}

export default PrintInvoice;