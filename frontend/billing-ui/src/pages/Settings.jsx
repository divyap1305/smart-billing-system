import { useState, useEffect } from "react";
import axios from "axios";
import "./Settings.css";

function Settings() {
  const [activeTab, setActiveTab] = useState("company");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Company Settings
  const [company, setCompany] = useState({
    name: "Selvam Motors",
    address: "1/500, Kumaramangalam, Junction",
    city: "Tiruchengode",
    district: "Namakkal",
    pincode: "637205",
    phone: "94894 83084",
    mobile: "99526 62809",
    email: "selvam.motors@gmail.com",
    gstin: "33EKJPS9727P1Z3",
    pan: "ABCDE1234F",
    cin: "U12345TN2020PTC123456"
  });

  // Invoice Settings
  const [invoice, setInvoice] = useState({
    prefix: "INV",
    suffix: "",
    startingNo: 1001,
    terms: "Goods once sold will not be taken back.",
    footer: "Thank you for your business!",
    showGst: true,
    showDiscount: false,
    defaultGst: 18,
    defaultPaymentMode: "Cash"
  });

  // Tax Settings
  const [taxes, setTaxes] = useState({
    gstRates: [0, 5, 12, 18, 28],
    defaultGst: 18,
    applyCess: false,
    cessRate: 0,
    hsnRequired: true
  });

  // Backup Settings
  const [backup, setBackup] = useState({
    autoBackup: false,
    backupFrequency: "daily",
    backupPath: "D:/Backups",
    lastBackup: "2024-03-15 10:30 AM"
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedCompany = localStorage.getItem("companySettings");
    if (savedCompany) setCompany(JSON.parse(savedCompany));

    const savedInvoice = localStorage.getItem("invoiceSettings");
    if (savedInvoice) setInvoice(JSON.parse(savedInvoice));

    const savedTaxes = localStorage.getItem("taxSettings");
    if (savedTaxes) setTaxes(JSON.parse(savedTaxes));

    const savedBackup = localStorage.getItem("backupSettings");
    if (savedBackup) setBackup(JSON.parse(savedBackup));
  };

  // Save all settings
  const saveSettings = () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      localStorage.setItem("companySettings", JSON.stringify(company));
      localStorage.setItem("invoiceSettings", JSON.stringify(invoice));
      localStorage.setItem("taxSettings", JSON.stringify(taxes));
      localStorage.setItem("backupSettings", JSON.stringify(backup));

      setMessage({ type: "success", text: "✅ Settings saved successfully!" });
      
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (err) {
      setMessage({ type: "error", text: "❌ Error saving settings" });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetDefaults = () => {
    if (window.confirm("Reset all settings to default values?")) {
      localStorage.removeItem("companySettings");
      localStorage.removeItem("invoiceSettings");
      localStorage.removeItem("taxSettings");
      localStorage.removeItem("backupSettings");
      loadSettings();
      setMessage({ type: "success", text: "✅ Reset to defaults!" });
    }
  };

  // Handle backup download
  const handleBackup = () => {
    const backupData = {
      company,
      invoice,
      taxes,
      backup,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `selvam-motors-backup-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setMessage({ type: "success", text: "✅ Backup downloaded!" });
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="header-left">
          <h1><span>⚙️</span> Settings</h1>
          <p>Configure your billing system</p>
        </div>
        <div className="header-right">
          <button className="btn-backup" onClick={handleBackup}>
            <span>💾</span> Backup
          </button>
          <button className="btn-reset" onClick={resetDefaults}>
            <span>🔄</span> Reset
          </button>
          <button className="btn-save" onClick={saveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs">
        <button 
          className={`tab-btn ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          🏢 Company
        </button>
        <button 
          className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          📄 Invoice
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          💰 Tax
        </button>
        <button 
          className={`tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          💾 Backup
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* COMPANY SETTINGS */}
        {activeTab === 'company' && (
          <div className="settings-card">
            <h2>Company Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({...company, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>GSTIN *</label>
                <input
                  type="text"
                  value={company.gstin}
                  onChange={(e) => setCompany({...company, gstin: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                rows="2"
                value={company.address}
                onChange={(e) => setCompany({...company, address: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={company.city}
                  onChange={(e) => setCompany({...company, city: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  value={company.district}
                  onChange={(e) => setCompany({...company, district: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={company.pincode}
                  onChange={(e) => setCompany({...company, pincode: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={company.phone}
                  onChange={(e) => setCompany({...company, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="text"
                  value={company.mobile}
                  onChange={(e) => setCompany({...company, mobile: e.target.value})}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({...company, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>PAN</label>
                <input
                  type="text"
                  value={company.pan}
                  onChange={(e) => setCompany({...company, pan: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>CIN</label>
              <input
                type="text"
                value={company.cin}
                onChange={(e) => setCompany({...company, cin: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* INVOICE SETTINGS */}
        {activeTab === 'invoice' && (
          <div className="settings-card">
            <h2>Invoice Settings</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Invoice Prefix</label>
                <input
                  type="text"
                  value={invoice.prefix}
                  onChange={(e) => setInvoice({...invoice, prefix: e.target.value})}
                  placeholder="INV"
                />
              </div>
              <div className="form-group">
                <label>Invoice Suffix</label>
                <input
                  type="text"
                  value={invoice.suffix}
                  onChange={(e) => setInvoice({...invoice, suffix: e.target.value})}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Starting Invoice Number</label>
              <input
                type="number"
                value={invoice.startingNo}
                onChange={(e) => setInvoice({...invoice, startingNo: Number(e.target.value)})}
              />
              <small>Next invoice will start from this number</small>
            </div>

            <div className="form-row">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={invoice.showGst}
                    onChange={(e) => setInvoice({...invoice, showGst: e.target.checked})}
                  />
                  Show GST on Invoice
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={invoice.showDiscount}
                    onChange={(e) => setInvoice({...invoice, showDiscount: e.target.checked})}
                  />
                  Show Discount on Invoice
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Default GST Rate (%)</label>
                <select
                  value={invoice.defaultGst}
                  onChange={(e) => setInvoice({...invoice, defaultGst: Number(e.target.value)})}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div className="form-group">
                <label>Default Payment Mode</label>
                <select
                  value={invoice.defaultPaymentMode}
                  onChange={(e) => setInvoice({...invoice, defaultPaymentMode: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Invoice Terms & Conditions</label>
              <textarea
                rows="3"
                value={invoice.terms}
                onChange={(e) => setInvoice({...invoice, terms: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Invoice Footer</label>
              <input
                type="text"
                value={invoice.footer}
                onChange={(e) => setInvoice({...invoice, footer: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* TAX SETTINGS */}
        {activeTab === 'tax' && (
          <div className="settings-card">
            <h2>Tax Settings</h2>
            
            <div className="form-group">
              <label>Default GST Rate</label>
              <select
                value={taxes.defaultGst}
                onChange={(e) => setTaxes({...taxes, defaultGst: Number(e.target.value)})}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={taxes.hsnRequired}
                  onChange={(e) => setTaxes({...taxes, hsnRequired: e.target.checked})}
                />
                HSN Code Required for Items
              </label>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={taxes.applyCess}
                  onChange={(e) => setTaxes({...taxes, applyCess: e.target.checked})}
                />
                Apply Cess
              </label>
            </div>

            {taxes.applyCess && (
              <div className="form-group">
                <label>Cess Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={taxes.cessRate}
                  onChange={(e) => setTaxes({...taxes, cessRate: Number(e.target.value)})}
                />
              </div>
            )}

            <div className="form-group">
              <label>Available GST Rates</label>
              <div className="gst-tags">
                {taxes.gstRates.map(rate => (
                  <span key={rate} className="gst-tag">{rate}%</span>
                ))}
              </div>
              <small>Configure in Item Master</small>
            </div>
          </div>
        )}

        {/* BACKUP SETTINGS */}
        {activeTab === 'backup' && (
          <div className="settings-card">
            <h2>Backup Settings</h2>
            
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={backup.autoBackup}
                  onChange={(e) => setBackup({...backup, autoBackup: e.target.checked})}
                />
                Enable Automatic Backup
              </label>
            </div>

            {backup.autoBackup && (
              <>
                <div className="form-group">
                  <label>Backup Frequency</label>
                  <select
                    value={backup.backupFrequency}
                    onChange={(e) => setBackup({...backup, backupFrequency: e.target.value})}
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Backup Location</label>
                  <div className="backup-path">
                    <input
                      type="text"
                      value={backup.backupPath}
                      onChange={(e) => setBackup({...backup, backupPath: e.target.value})}
                    />
                    <button className="btn-browse">Browse</button>
                  </div>
                </div>
              </>
            )}

            <div className="backup-info">
              <p><strong>Last Backup:</strong> {backup.lastBackup}</p>
              <p><strong>Database Size:</strong> 2.3 MB</p>
              <p><strong>Total Backups:</strong> 12</p>
            </div>

            <div className="backup-actions">
              <button className="btn-backup-now" onClick={handleBackup}>
                <span>💾</span> Backup Now
              </button>
              <button className="btn-restore">
                <span>🔄</span> Restore
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;