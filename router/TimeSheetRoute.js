const express = require('express');
const router = express.Router();
const {getAllTimeSheet, createTimeSheet, deleteTimeSheet, updateTimeSheet} = require('../controllers/TimeSheetController');


router.post('/add', createTimeSheet);
router.get('/all', getAllTimeSheet);
router.put('/:id', updateTimeSheet);
router.delete('/:id',deleteTimeSheet);

module.exports =router;