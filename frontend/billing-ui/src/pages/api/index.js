const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const authRoutes = require("../backend/routes/authRoutes");
const itemRoutes = require("../backend/routes/itemRoutes");
const invoiceRoutes = require("../backend/routes/invoiceRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/invoices", invoiceRoutes);

module.exports = serverless(app);