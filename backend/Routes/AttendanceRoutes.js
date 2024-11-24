const express = require('express');
const { attend, getAllAttendances, deleteAttendance, getAllAttendancesForGroup, getAllAttendancesForLecture, updateAttendanceHomework, getAttend } = require('../controllers/AttendanceController');
const router = express.Router();

router.post('/attend', attend);
router.get('/:attendId', getAttend);
router.get('/', getAllAttendances);
router.get('/group/:groupId', getAllAttendancesForGroup);
router.get('/lecture/:lectureId', getAllAttendancesForLecture);
router.delete('/:id', deleteAttendance);
router.patch('/:id', updateAttendanceHomework);

module.exports = router;
