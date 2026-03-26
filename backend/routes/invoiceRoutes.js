const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

// Create invoice
router.post("/", async (req, res) => {
  try {
    let {
      invoiceNo,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      discount,
      gst,
      notes,
      totalAmount,
      paymentMode,
      paidAmount
    } = req.body;

    // FIX: ensure invoiceNo is a valid number
    invoiceNo = Number(invoiceNo);

    if (!invoiceNo || isNaN(invoiceNo)) {
      const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 });
      invoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1;
    }

    // Calculate financials
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmount = discount || 0;
    const gstAmount = gst ? ((subtotal - discountAmount) * gst / 100) : 0;
    const calculatedTotal = subtotal - discountAmount + gstAmount;
    
    // Payment calculation
    const paid = paidAmount || calculatedTotal;
    const pending = calculatedTotal - paid;
    const paymentStatus = pending === 0 ? 'Paid' : (paid === 0 ? 'Pending' : 'Partial');

    const newInvoice = new Invoice({
      invoiceNo,
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      discount: discountAmount,
      gst: gst || 0,
      gstAmount,
      totalAmount: calculatedTotal,
      paymentMode: paymentMode || 'Cash',
      paymentStatus,
      paidAmount: paid,
      pendingAmount: pending,
      notes: notes || ""
    });

    await newInvoice.save();

    if (customerId && pending > 0) {
      const Customer = require("../models/Customer");
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { 
          outstandingBalance: pending,
          creditUsed: pending
        }
      });
    }

    if (customerId) {
      const Customer = require("../models/Customer");
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { 
          totalPurchases: 1,
          totalSpent: paid
        },
        lastPurchase: new Date()
      });
    }

    res.json({ 
      message: "Invoice saved successfully", 
      invoice: newInvoice 
    });

  } catch (error) {
    console.error("Invoice creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all invoices
router.get("/", async (req, res) => {
  const invoices = await Invoice.find().sort({ invoiceNo: -1 });
  res.json(invoices);
});

// Get invoice by number
router.get("/:invoiceNo", async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo });
  res.json(invoice);
});

// SEARCH invoices
router.get("/search/:keyword", async (req, res) => {
  const keyword = req.params.keyword;

  const results = await Invoice.find({
    $or: [
      { customerName: { $regex: keyword, $options: "i" } },
      { customerPhone: { $regex: keyword, $options: "i" } },
      { invoiceNo: Number(keyword) || -1 }
    ]
  }).sort({ invoiceNo: -1 });

  res.json(results);
});

// SETTLE OUTSTANDING PAYMENT
router.post("/payment/:invoiceId", async (req, res) => {
  try {
    const { paymentAmount, paymentMode } = req.body;
    
    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const newPaidAmount = invoice.paidAmount + paymentAmount;
    const newPendingAmount = invoice.totalAmount - newPaidAmount;
    
    invoice.paidAmount = newPaidAmount;
    invoice.pendingAmount = newPendingAmount;
    invoice.paymentStatus = newPendingAmount === 0 ? 'Paid' : 'Partial';
    invoice.paymentMode = paymentMode || invoice.paymentMode;
    
    await invoice.save();

    if (invoice.customerId) {
      const Customer = require("../models/Customer");
      await Customer.findByIdAndUpdate(invoice.customerId, {
        $inc: { 
          outstandingBalance: -paymentAmount,
          creditUsed: -paymentAmount
        }
      });
    }

    res.json({ 
      message: "Payment recorded successfully",
      invoice 
    });

  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;