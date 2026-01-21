// const mongoose = require('mongoose');

// const channelSchema = new mongoose.Schema({
//  name: String,                  // "general", "project-alpha"
//   type: {
//     type: String,
//     enum: ["public", "private", "dm"],
//     default: "public",
//   },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// }, { timestamps: true });

// module.exports = mongoose.model('Channel', channelSchema);


const mongoose = require('mongoose');


// const sheetSchema = new mongoose.Schema(
//   {
//     title: String,
//     columns: [
//       {
//         key: String,
//         label: String
//       }
//     ],
//     rows: [mongoose.Schema.Types.Mixed]
//   },
//   { _id: false }
// );


const timeSheetSchema = new mongoose.Schema({
    clientId: String,
  clientName: String,

  projectId: {
  type: String,
  unique: true,
  sparse: true,
},
  projectType: String,
  proposalType: String,
  projectTitle:String,

  workDate: Date,
  task: String,
 status: {
  type: String,
  enum: ["Pending", "Approved", "Rejected"],
  default: "Pending"
},

 sheets: {
  type: Object,   // 👈 IMPORTANT
  default: {}
},

  totalAppHrs: Number,
  totalAdminHrs: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });


module.exports  = mongoose.model('Timesheet', timeSheetSchema)