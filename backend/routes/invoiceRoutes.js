const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");

// Create invoice
router.post("/", async (req, res) => {
  try {
    const {
      invoiceNo,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount
    } = req.body;

    const newInvoice = new Invoice({
      invoiceNo,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount
    });

    await newInvoice.save();
    res.json({ message: "Invoice saved successfully", invoice: newInvoice });

  } catch (error) {
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

module.exports = router;