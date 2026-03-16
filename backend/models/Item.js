const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true
  },

  defaultRate: {
    type: Number,
    required: true,
    min: 0
  },

  itemCode: {
    type: String,
    unique: true,
    sparse: true
  },

  category: {
    type: String,
    default: "Uncategorized"
  },

  stock: {
    type: Number,
    default: 0
  },

  gst: {
    type: Number,
    default: 18
  },

  hsnCode: String,

  description: String,

  reorderLevel: {
    type: Number,
    default: 5
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Item", itemSchema);