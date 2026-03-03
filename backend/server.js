const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ MIDDLEWARES FIRST
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB CONNECTION
const connectDB = require("./config/db");
connectDB();

// ROUTES AFTER MIDDLEWARE
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);

const invoiceRoutes = require("./routes/invoiceRoutes");
app.use("/api/invoices", invoiceRoutes);

const customerRoutes = require("./routes/customerRoutes");
app.use("/api/customers", customerRoutes);

app.get("/", (req, res) => {
  res.send("Smart Billing API running");
});

mongoose
  .connect("mongodb://127.0.0.1:27017/smartbilling")
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));