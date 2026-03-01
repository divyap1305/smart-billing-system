const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model("User", userSchema);