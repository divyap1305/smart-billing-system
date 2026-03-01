const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  defaultRate: { type: Number, default: 0 }
});

module.exports = mongoose.model("Item", itemSchema);