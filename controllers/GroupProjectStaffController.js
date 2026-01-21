const GroupedProject = require('../models/ProjectGroups');

const groupProject = async (req, res) => {
  try {
    const { projectId, projectType, staff, projectTitle, clientName } = req.body;

    if (!projectId || !staff?.length || !projectTitle) {
      return res.status(400).json({ message: "Invalid Data" });
    }

    const groupedProject = await GroupedProject.create({
      projectId,
      projectTitle,
      projectType,
      clientName,
      staff: staff.map(s=>({staffId:s._id, name: s.name, staffRole:s.staffRole }))
    });

    res.status(201).json({
      message: "Project grouped successfully!",
      data: groupedProject,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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

const updateProjectGroup = async (req, res) =>{

    try {
        const { id } = req.params;
    const { staff } = req.body;

    // ✅ validate input
    if (!Array.isArray(staff) || staff.length === 0) {
      return res.status(400).json({ message: "Staff is required" });
    }

    const existProjectGroup = await GroupedProject.findById(id);

     if (!existProjectGroup) {
      return res.status(404).json({ message: "Project group not found" });
    }
     existProjectGroup.staff = staff;

  existProjectGroup.staff = staff.map(s => ({
      staffId: s._id,
      name: s.name,
      staffRole: s.staffRole,
    }));

    await existProjectGroup.save();

         res.json({
      message: "Project group staff updated successfully",
      data: existProjectGroup,
    });

    } catch (error) {
       console.error("Update Project Group Error:", error);
    res.status(500).json({ message: "Server error" }); 
    }
}

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
