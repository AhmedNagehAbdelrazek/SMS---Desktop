const express = require('express');
const { addMonthlyExam, addMonthlyExamGrade, getAllMonthlyExams, getMonthExamFullReport } = require('../controllers/examController');
const router = express.Router();

router.post('/', addMonthlyExam);
router.post('/grade', addMonthlyExamGrade);
router.get('/', getAllMonthlyExams);
router.get('/report/:id', getMonthExamFullReport);

module.exports = router;
