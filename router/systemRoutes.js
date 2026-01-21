// routes/systemRoutes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");

let maintenanceMode = false;

router.get("/status", (req, res) => {
  res.json({ maintenance: maintenanceMode });
});

router.post("/toggle", protect, adminOnly, (req, res) => {
  maintenanceMode = !maintenanceMode;
  res.json({ maintenance: maintenanceMode });
});

module.exports = router;
