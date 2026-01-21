const mongoose = require('mongoose');

const groupedProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },  // store project ID
    projectTitle: { type: String, required: true }, // store project title directly
    projectType: { type: String, required: true },
    staff: [
      {
        staffId: { type: String, required: true }, // optional if you need ID
        name: { type: String, required: true },   // store staff name directly
        staffRole: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupedProject", groupedProjectSchema);
