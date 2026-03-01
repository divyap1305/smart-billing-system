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
  totalAmount: Number
});

module.exports = mongoose.model("Invoice", invoiceSchema);