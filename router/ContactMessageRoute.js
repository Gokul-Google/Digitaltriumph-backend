const express = require("express");
const ContactMessage = require("../models/ContactMessage");
const router = express.Router();


// ✅ SAVE MESSAGE
router.post("/", async (req, res) => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET UNREAD MESSAGES (MUST BE FIRST)
router.get("/unread", async (req, res) => {
  try {
    const messages = await ContactMessage
      .find({ read: false })
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ MARK AS READ
router.patch("/:id/read", async (req, res) => {
  try {
    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET ALL MESSAGES
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
