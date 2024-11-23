const express = require('express');
const attendanceRoutes = require('./AttendanceRoutes');
const examRoutes = require('./examRoutes');
const backupRoutes = require('./backupRoutes');
const groupRoutes = require('./GroupRoutes');

const router = express.Router();

router.use('/attendance', attendanceRoutes);
router.use('/backup', backupRoutes);
router.use('/monthexam', examRoutes);
router.use('/group', groupRoutes);
router.use("/lecture", require('./LectureRoutes'));
router.use('/student', require('./StudentsRoutes'));

module.exports = router;
