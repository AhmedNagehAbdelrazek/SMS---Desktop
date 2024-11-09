const express = require('express');
const { getAllLectures, getAllLecturesForGroup } = require('../controllers/LectureController');
const router = express.Router();
const { setLectureExamGrade, updateLectureExamGrade } = require('../controllers/gradeController');


router.get('/',getAllLectures);
router.get('/:groupId',getAllLecturesForGroup);

router.post('/grade', setLectureExamGrade);
router.patch('/grade', updateLectureExamGrade);

module.exports = router;
