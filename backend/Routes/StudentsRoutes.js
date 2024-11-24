const { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, chnageGroup, searchStudents, analyzeStudentPerformance } = require("../controllers/StudentController");

const router = require("express").Router();


router.post("/", addStudent);
router.get('/', getAllStudents); 
router.get('/:id', getStudentById); 
router.patch('/:id', updateStudent); 
router.delete('/:id', deleteStudent); 

router.patch("/group/:id",chnageGroup);

router.get('/analysis/report/:id', analyzeStudentPerformance);

module.exports = router;