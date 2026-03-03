const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: Number, required: true, unique: true },
  date: { type: Date, default: Date.now },
  
  // Customer details
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  
  // Items
  items: [
    {
      name: String,
      qty: Number,
      rate: Number,
      amount: Number
    }
  ],
  
  // Financial details
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // ✅ NEW PAYMENT FIELDS
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'Card', 'UPI', 'Credit', 'Partial'],
    default: 'Cash'
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Paid'
  },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  
  notes: { type: String, default: "" }
});

module.exports = mongoose.model("Invoice", invoiceSchema);