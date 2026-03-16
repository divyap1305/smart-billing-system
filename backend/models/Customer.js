const mongoose = require("mongoose");

// This is like a blueprint for customer data
const customerSchema = new mongoose.Schema({
  // Customer name - required field
  name: { 
    type: String, 
    required: [true, "Customer name is required"] 
  },
  
  // Phone number - unique for each customer
  phone: { 
    type: String, 
    required: [true, "Phone number is required"],
    unique: true, // No duplicate phone numbers
    validate: {
      validator: function(v) {
        // Indian phone number validation (10 digits, starts with 6-9)
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  
  // Address - optional but recommended
  address: { 
    type: String 
  },
  
  // Email - optional
  email: { 
    type: String,
    validate: {
      validator: function(v) {
        // Basic email validation
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  
  // GST Number - optional for businesses
  gstNo: { 
    type: String 
  },
  
  // Total purchases (auto-updated)
  totalPurchases: { 
    type: Number, 
    default: 0 
  },
  
  // Total amount spent
  totalSpent: { 
    type: Number, 
    default: 0 
  },
  
  // Last purchase date
  lastPurchase: { 
    type: Date 
  },
  
  // Credit limit (if you allow credit)
  creditLimit: { 
    type: Number, 
    default: 0 
  },
  
  // Current outstanding balance
  outstandingBalance: { 
    type: Number, 
    default: 0 
  },
  
    totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastPurchase: { type: Date },
  creditUsed: {
    type: Number,
    default: 0
  },           // How much of limit used

  // Customer since
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create the model
module.exports = mongoose.model("Customer", customerSchema);