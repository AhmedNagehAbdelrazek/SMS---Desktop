const asyncHandler = require("express-async-handler");
const { Student, Group } = require("../models/index");

exports.addStudent = asyncHandler(async (req, res) => {
    const body = req.body;
    const group_id = req.body.group_id;
    if(group_id){
        const group = await Group.findByPk(group_id);
        if(!group){
            return res.status(404).json({ message: 'Group not found' });
        }
    }

    if(Array.isArray(body)){
        // create a bulk students
        const students = await Student.bulkCreate(body);

        return res.status(200).json(students);
    }

    const new_student = await Student.create({ ...req.body });
    return res.status(200).json(new_student);
});
exports.getAllStudents = asyncHandler(async (req, res) => {
    const students = await Student.findAll();
    return res.status(200).json(students);
});
exports.getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json(student);
});
exports.updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await student.update({ ...body });
    return res.status(200).json(updatedStudent);
});
exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    await student.destroy();
    return res.status(200).json({ message: 'Student deleted successfully' });
});

exports.chnageGroup = asyncHandler(async (req, res) => {
    const { id:group_id } = req.params;
    const {student_id} = req.body;

    const student = await Student.findByPk(student_id);
    const group = await Group.findByPk(group_id);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    if(!group){
        return res.status(404).json({ message: 'Group not found' });
    }
    const updatedStudent = await student.update({group_id});
    return res.status(200).json(updatedStudent);
});
