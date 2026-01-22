const mongoose = require('mongoose');

const groupedProjectSchema = new mongoose.Schema(
  {
    
    projectId: { type: String, required: true },  // store project ID
     generatedProjectId: { type: String, required: true }, // from timesheet.projectId
    projectTitle: { type: String, required: true }, // store project title directly
    projectType: { type: String, required: true },
    clientName: { type: String},
    status:{
    type: String,
    enum: ["Initial", "Testing", "Review", "Completed"],
    default: "Initial",
    },
    testingSiteLink: {
      type: String,
      default: null,   //  initially null
    },
    finalSiteLink: {
      type: String,
      default: null,
    },
    buildFileLink: {
      type: String,
      default: null,
    },
    staff: [
      {
        staffId: { 
          type: mongoose.Schema.Types.ObjectId, 
          required: true }, // optional if you need ID
        name: { type: String, required: true },   // store staff name directly
        staffRole: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupedProject", groupedProjectSchema);
