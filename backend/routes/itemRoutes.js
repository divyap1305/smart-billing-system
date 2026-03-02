const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Create item
router.post("/", async (req, res) => {
  try {
    const { name, defaultRate } = req.body;

    const existing = await Item.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Item already exists" });
    }

    const newItem = new Item({ name, defaultRate });
    await newItem.save();

    res.json({ message: "Item added successfully", item: newItem });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all items
router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Search item
router.get("/search/:keyword", async (req, res) => {
  const keyword = req.params.keyword;

  const items = await Item.find({
    name: { $regex: keyword, $options: "i" }
  }).limit(10);

  res.json(items);
});

module.exports = router;