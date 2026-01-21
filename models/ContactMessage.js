// const mongoose = require("mongoose");

// const messageSchema = new mongoose.Schema(
//   {
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     channelId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Channel",
//       required: true,
//     },
//     senderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     text: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Message", messageSchema);


const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    validate: {
      validator: v => /\S+@\S+\.\S+/.test(v),
      message: "Email must be in a valid format!"
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: "Phone number must be 10 digits!"
    }
  },
  service: String,
  read: {
    type: Boolean,
    default: false
  },
  message: String
}, { timestamps: true });

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
