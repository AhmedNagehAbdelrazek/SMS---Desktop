const express = require('express');
const { attend, getAllAttendances, deleteAttendance, getAllAttendancesForGroup, getAllAttendancesForLecture } = require('../controllers/AttendanceController');
const router = express.Router();

router.post('/attend', attend);
router.get('/', getAllAttendances);
router.get('/group/:groupId', getAllAttendancesForGroup);
router.get('/lecture/:lectureId', getAllAttendancesForLecture);
router.delete('/:id', deleteAttendance);

module.exports = router;
