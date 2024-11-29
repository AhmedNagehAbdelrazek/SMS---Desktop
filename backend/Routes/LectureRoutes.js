const express = require('express');
const { getAllLectures, getAllLecturesForGroup } = require('../controllers/LectureController');
const router = express.Router();
const { setLectureExamGrade, updateLectureExamGrade, getAllStudentsWithGrades } = require('../controllers/gradeController');


router.get('/',getAllLectures);
router.get('/:groupId',getAllLecturesForGroup);

router.get('/grade/report', getAllStudentsWithGrades);
router.post('/grade', setLectureExamGrade);
router.patch('/grade', updateLectureExamGrade);

module.exports = router;
