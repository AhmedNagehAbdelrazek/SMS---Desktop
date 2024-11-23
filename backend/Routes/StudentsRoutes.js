const { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, chnageGroup, searchStudents } = require("../controllers/StudentController");

const router = require("express").Router();


router.post("/", addStudent);
router.get('/', getAllStudents); 
router.get('/:id', getStudentById); 
router.patch('/:id', updateStudent); 
router.delete('/:id', deleteStudent); 

router.patch("/group/:id",chnageGroup);

router.get('/search/students', searchStudents);

module.exports = router;