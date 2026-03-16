const express = require("express");
const router = express.Router();
const Item = require("../models/Item");


// CREATE ITEM
router.post("/", async (req, res) => {

  try {

    const { name, defaultRate } = req.body;

    if (!name || !defaultRate) {
      return res.status(400).json({
        message: "Name and rate required"
      });
    }

    const existing = await Item.findOne({
      name: { $regex: `^${name}$`, $options: "i" }
    });

    if (existing) {
      return res.status(400).json({
        message: "Item already exists"
      });
    }

    const newItem = new Item(req.body);

    await newItem.save();

    res.status(201).json({
      message: "Item added successfully",
      item: newItem
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


// GET ALL ITEMS
router.get("/", async (req, res) => {

  try {

    const items = await Item.find().sort({ name: 1 });

    res.json(items);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


// SEARCH ITEMS
router.get("/search/:keyword", async (req, res) => {

  try {

    const keyword = req.params.keyword;

    const items = await Item.find({
      name: { $regex: keyword, $options: "i" }
    })
      .limit(10)
      .sort({ name: 1 });

    res.json(items);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


// UPDATE ITEM
router.put("/:id", async (req, res) => {

  try {

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(item);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});


// DELETE ITEM
router.delete("/:id", async (req, res) => {

  try {

    await Item.findByIdAndDelete(req.params.id);

    res.json({
      message: "Item deleted successfully"
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

module.exports = router;