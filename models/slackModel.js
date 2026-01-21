const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sessionId: String,
  text: String,
  from: String, // 'user' or 'slack'
  ts: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SlackMessage", messageSchema);
