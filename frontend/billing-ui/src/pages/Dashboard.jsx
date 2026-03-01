import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Selvam Motors Billing Dashboard</h2>

      <button 
        onClick={() => navigate("/create-invoice")}
        style={{ display: "block", margin: "20px 0", padding: "10px" }}>
        ➕ Create Invoice
      </button>

      <button 
        onClick={() => navigate("/items")}
        style={{ display: "block", margin: "20px 0", padding: "10px" }}>
        🛠 Item Master
      </button>

      <button 
        onClick={() => navigate("/invoices")}
        style={{ display: "block", margin: "20px 0", padding: "10px" }}>
        📄 Invoice History / Reprint
      </button>

    </div>
  );
}

export default Dashboard;