const express = require('express');
const Timesheet = require('../models/TimeSheetModel')


const generateProjectId = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 26
  const month = String(now.getMonth() + 1).padStart(2, "0"); // 01
  const prefix = `PI${year}${month}`; // PI2601
  const lastSheet = await Timesheet.findOne({
    projectId: { $regex: `^${prefix}` }, // SAME year + month
  })
    .sort({ projectId: -1 })
    // .select("projectId");
  let count = 1;
  if (lastSheet?.projectId) {
    const lastCount = parseInt(lastSheet.projectId.slice(prefix.length), 10);
   if (!isNaN(lastCount)) count = lastCount + 1;
  }

  return `${prefix}${String(count).padStart(3, "0")}`; // PI2601001
};


const createTimeSheet = async (req, res) =>{
try {
  const projectId = await generateProjectId();
    const sheet = await Timesheet.create({
        ...req.body,
        projectId,
        projectTitle: req.body.projectTitle || "",        
        status: "Pending",
        createdBy: req.user?._id
    });
    res.status(201).json(sheet);
console.log(sheet);
} catch (error) {
    res.status(500).json({message: error.message});
}
};

const getAllTimeSheet = async (req, res) =>{
    try{
const sheets = await Timesheet.find()
.sort({ createdAt: -1 });
//  console.log(
//       "BACKEND SHEETS 👉",
//       sheets.map(s => ({
//         id: s._id,
//         hasSheets: !!s.sheets,
//         sheetsType: typeof s.sheets
//       }))
//     );
res.json(sheets);
    }catch(error)
    {
res.status(500).json({message: error.message});
    }
};

const updateTimeSheet = async (req, res) => {
  try {
    const updateData = {};
    // Auto-generate projectId if missing
    const existingSheet = await Timesheet.findById(req.params.id);
    
    if (!existingSheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

     // Auto-generate projectId if missing
    if (!existingSheet.projectId) {
      updateData.projectId = await generateProjectId();
    }

    // Only assign fields if they exist
    if (req.body.clientId) updateData.clientId = req.body.clientId;
    if (req.body.clientName) updateData.clientName = req.body.clientName;
    if (req.body.projectTitle) updateData.projectTitle = req.body.projectTitle;

    if (req.body.projectType) updateData.projectType = req.body.projectType;
    if (req.body.proposalType) updateData.proposalType = req.body.proposalType;
    if (req.body.task) updateData.task = req.body.task;
    if (req.body.workDate) updateData.workDate = req.body.workDate;

    // ⚠️ CRITICAL FIX
    if (Array.isArray(req.body.sheets)) {
      updateData.modules = req.body.sheets;
    }
 // ✅ IMPORTANT FIX
    // if (req.body.sheets && typeof req.body.sheets === "object") {
    //   updateData.sheets = req.body.sheets;
    // }
    
    if (typeof req.body.totalAppHrs === "number") {
      updateData.totalAppHrs = req.body.totalAppHrs;
    }

    if (typeof req.body.totalAdminHrs === "number") {
      updateData.totalAdminHrs = req.body.totalAdminHrs;
    }

    // Status only allowed on update
    if (["Approved", "Rejected"].includes(req.body.status)) {
      updateData.status = req.body.status;
    }

    const updatedSheet = await Timesheet.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },   // ✅ prevents full overwrite
      { new: true }
    );

    res.json(updatedSheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteTimeSheet = async (req, res) => {
    try {
        await Timesheet.findByIdAndDelete(req.params.id);
        res.json({success: true, message: "Timesheet deleted successfully!"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}



module.exports = {getAllTimeSheet, createTimeSheet, deleteTimeSheet, updateTimeSheet}

