const express = require('express');
const router = express.Router();
const {groupProject, groupedProjects, deleteProjectGroup, updateProjectGroup } = require('../controllers/GroupProjectStaffController.js')



router.post('/group-project', groupProject);
router.get('/groupedprojects', groupedProjects);
router.put('/group-project/:id', updateProjectGroup);
router.delete('/group-project/:id', deleteProjectGroup);


module.exports = router;