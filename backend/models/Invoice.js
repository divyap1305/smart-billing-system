const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNo: Number,
  date: { type: Date, default: Date.now },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  items: [
    {
      name: String,
      qty: Number,
      rate: Number,
      amount: Number
    }
  ],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  totalAmount: Number
});

module.exports = mongoose.model("Invoice", invoiceSchema);