import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import Items from "./pages/Items";
import PrintInvoice from "./pages/PrintInvoice";
import InvoiceHistory from "./pages/InvoiceHistory";
import ForgotPassword from './pages/ForgotPassword';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Reports from './pages/Reports';

function App() {
  const isLoggedIn = localStorage.getItem("token") !== null;

  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route 
        path="/dashboard" 
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} 
      />

      <Route 
        path="/create-invoice" 
        element={isLoggedIn ? <CreateInvoice /> : <Navigate to="/" />} 
      />

      <Route 
        path="/items" 
        element={isLoggedIn ? <Items /> : <Navigate to="/" />} 
      />

      <Route 
        path="/print-invoice/:invoiceNo" 
        element={isLoggedIn ? <PrintInvoice /> : <Navigate to="/" />} 
      />

      <Route 
        path="/invoices" 
        element={isLoggedIn ? <InvoiceHistory /> : <Navigate to="/" />} 
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
       />
      <Route
        path="/customers"
        element={isLoggedIn ? <Customers /> : <Navigate to="/" />}
       />
      <Route
        path="/settings"
        element={isLoggedIn ? <Settings /> : <Navigate to="/" />}
       />
      <Route
        path="/reports"
        element={isLoggedIn ? <Reports /> : <Navigate to="/" />}
       />

    </Routes>
  );
}

export default App;