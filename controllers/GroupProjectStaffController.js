const GroupedProject = require('../models/ProjectGroups');
const TimeSheet = require('../models/TimeSheetModel');
const User = require('../models/UserModel');


const groupProject = async (req, res) => {
  try {
    const { projectId, projectType, staff, projectTitle, clientName } = req.body;

    if (!projectId  || !Array.isArray(staff) || staff.length === 0 || !projectTitle) {
      return res.status(400).json({ message: "Invalid Data" });
    }
 
    const timeSheet = await TimeSheet.findById(projectId);
    if (!timeSheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    // const generatedProjectId = timeSheet.projectId;

    const groupedProject = await GroupedProject.create({
 
      // projectId : generatedProjectId,
       projectId: timeSheet._id,             // Timesheet document _id
  generatedProjectId: timeSheet.projectId, // ✅ From TimeSheet.projectId
      projectTitle,
      projectType,
     status: "Initial",
      testingSiteLink: null,
      finalSiteLink: null,
      buildFileLink: null,
      clientName,
      staff: staff.map(s=>({staffId:s.staffId, name: s.name, staffRole:s.staffRole }))
    });

    res.status(201).json({
      message: "Project grouped successfully!",
      data: groupedProject,
    });

  } catch (error) {
    console.error("GROUP PROJECT ERROR:", error);
  res.status(500).json({ message: error.message, stack: error.stack });
  }
};

const groupedProjects = async (req, res) => {
  try {
    const projects = await GroupedProject.find()
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProjectGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff, status, testingSiteLink, finalSiteLink, buildFileLink } = req.body;

    const project = await GroupedProject.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Update staff
    if (Array.isArray(staff)) {
      project.staff = staff.map(s => ({
        staffId: s.staffId || s._id,
        name: s.name,
        staffRole: s.staffRole,
      }));
    }

    // ✅ Update status
    if (status) {
      project.status = status;

      if (status === "Testing") {
        project.testingSiteLink = testingSiteLink || project.testingSiteLink;
        project.finalSiteLink = null;
        project.buildFileLink = null;
      }

      if (status === "Completed") {
        project.finalSiteLink = finalSiteLink || project.finalSiteLink;
        project.buildFileLink = buildFileLink || project.buildFileLink;
        project.testingSiteLink = null;

        project.isGrouped = false;

        //Decrement currentProject for each assigned staff
        for(let s of project.staff){
          await User.findByIdAndUpdate(s.staffId, {$inc :{currentProjects : -1 }});
        }
      }
      
    }

    await project.save();

    res.json({
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Update Project Group Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





const deleteProjectGroup = async (req, res) => {
  try {
    const deleted = await GroupedProject.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Project group not found" });
    }

    res.json({ message: "Project group deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { groupProject, groupedProjects, deleteProjectGroup, updateProjectGroup };
