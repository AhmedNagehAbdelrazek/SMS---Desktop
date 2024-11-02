const { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, chnageGroup } = require("../controllers/StudentController");

const router = require("express").Router();


router.post("/", addStudent);
router.get('/', getAllStudents); 
router.get('/:id', getStudentById); 
router.patch('/:id', updateStudent); 
router.delete('/:id', deleteStudent); 

router.patch("/group/:id",chnageGroup);

module.exports = router;