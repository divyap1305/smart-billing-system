const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// ========== TEST ROUTE ==========
router.get("/test", (req, res) => {
  res.json({ 
    message: "✅ Customer routes working!",
    timestamp: new Date().toLocaleString()
  });
});

// ========== GET ALL CUSTOMERS ==========
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all customers..."); // Debug log
    const customers = await Customer.find().sort({ createdAt: -1 });
    console.log(`Found ${customers.length} customers`); // Debug log
    res.json(customers);
  } catch (error) {
    console.error("Error in GET /customers:", error); // Full error log
    res.status(500).json({ 
      message: "Error fetching customers", 
      error: error.message // Send actual error to client
    });
  }
});

// ========== SEARCH CUSTOMER BY PHONE ==========
router.get("/search/:phone", async (req, res) => {
  try {
    console.log("Searching for phone:", req.params.phone); // Debug log
    const customer = await Customer.findOne({ phone: req.params.phone });
    
    if (customer) {
      console.log("Customer found:", customer.name); // Debug log
      res.json(customer);
    } else {
      console.log("No customer found with phone:", req.params.phone); // Debug log
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    console.error("Error in search:", error); // Full error log
    res.status(500).json({ 
      message: "Error searching customer",
      error: error.message 
    });
  }
});

// ========== SEARCH BY NAME (for dropdown) ==========
router.get("/search/name/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;
    console.log("Searching by name:", keyword); // Debug log
    
    const customers = await Customer.find({
      name: { $regex: keyword, $options: "i" }
    }).limit(10);
    
    console.log(`Found ${customers.length} customers by name`); // Debug log
    res.json(customers);
  } catch (error) {
    console.error("Error in name search:", error);
    res.status(500).json({ 
      message: "Error searching customers by name",
      error: error.message 
    });
  }
});

// ========== CREATE NEW CUSTOMER ==========
router.post("/", async (req, res) => {
  try {
    console.log("Creating new customer with data:", req.body); // Debug log
    
    const { name, phone, address, email, gstNo, creditLimit } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({ 
        message: "Name and phone are required fields" 
      });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ 
        message: "Customer with this phone number already exists" 
      });
    }

    // Create new customer
    const customer = new Customer({
      name,
      phone,
      address: address || "",
      email: email || "",
      gstNo: gstNo || "",
      creditLimit: creditLimit || 0,
      totalPurchases: 0,
      totalSpent: 0,
      outstandingBalance: 0
    });

    await customer.save();
    console.log("Customer created successfully:", customer._id); // Debug log

    res.status(201).json({
      message: "Customer added successfully",
      customer
    });

  } catch (error) {
    console.error("Error in POST /customers:", error); // Full error log
    res.status(500).json({ 
      message: "Error creating customer", 
      error: error.message 
    });
  }
});

// ========== GET SINGLE CUSTOMER BY ID ==========
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching customer with ID:", req.params.id); // Debug log
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ 
      message: "Error fetching customer",
      error: error.message 
    });
  }
});

// ========== UPDATE CUSTOMER ==========
router.put("/:id", async (req, res) => {
  try {
    console.log("Updating customer:", req.params.id); // Debug log
    console.log("Update data:", req.body); // Debug log

    const { name, phone, address, email, gstNo, creditLimit } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, email, gstNo, creditLimit },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("Customer updated successfully"); // Debug log
    res.json({
      message: "Customer updated successfully",
      customer
    });

  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ 
      message: "Error updating customer",
      error: error.message 
    });
  }
});

// ========== DELETE CUSTOMER ==========
router.delete("/:id", async (req, res) => {
  try {
    console.log("Deleting customer:", req.params.id); // Debug log
    
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    console.log("Customer deleted successfully"); // Debug log
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ 
      message: "Error deleting customer",
      error: error.message 
    });
  }
});

module.exports = router;