const expressAsyncHandler = require('express-async-handler');
const {Exam,Month_Exam, Student, Group} = require('../models/');

exports.addMonthlyExam =expressAsyncHandler( async (req, res) => {
    const { date, groupId ,name , examFullMark} = req.body;
    const groupExist = await Group.findByPk(groupId);
    if (!groupExist) {
        return res.status(404).json({ message: 'Group not found' });
    }
    
    try {
        const exam = await Month_Exam.create({
            date,
            name,
            exam_full_mark:examFullMark,
            group_id:groupId,
        });
        res.status(200).json({ message: 'Monthly exam added', exam });
    } catch (error) {
        res.status(500).json({ error: 'Error adding exam' });
    }
});

exports.addMonthlyExamGrade = expressAsyncHandler(async (req, res) => {
    const { studentId, grade ,monthExamId} = req.body;
    const monthExamExist = await Month_Exam.findByPk(monthExamId);
    if (!monthExamExist) {
        return res.status(404).json({ message: 'Exam not found' });
    }
    const studentExist = await Student.findOne({ where: { id: studentId, group_id: monthExamExist.group_id } });
    if (!studentExist) {
        return res.status(404).json({ message: 'Student not found' });
    }

    try {
        const examGrade = await Exam.upsert({
            student_id:studentId,
            month_exam_id:monthExamId,
            grade
        });
        res.status(200).json({ message: 'Grade updated', examGrade });
    } catch (error) {
        res.status(500).json({ error: 'Error setting grade' });
    }
})

exports.getAllMonthlyExams = expressAsyncHandler(async (req, res) => {
    try {
        const exams = await Month_Exam.findAll();
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ error: 'Error getting exams' });
    }
});

exports.getMonthExamFullReport = expressAsyncHandler(async (req, res) => {
    const { id:monthExamId } = req.params;
    const examExist = await Month_Exam.findByPk(monthExamId);
    if (!examExist) {
        return res.status(404).json({ message: 'Exam not found' });
    }
    const groupId = examExist.group_id;

    try {
        const exams = await Exam.findAll({ where: { month_exam_id: monthExamId } });
        const studentsAttended = exams.map(exam => exam.student_id);

        const allStudents = await Student.findAll({
            where: { group_id: groupId, isDeleted: false },
        });
        const studentsAttendedExam = allStudents.filter(student  => studentsAttended.includes(student.id));

        const notAttendedStudents = allStudents.filter(student => !studentsAttendedExam.includes(student.id));

        const result = {
            exams,
            totalSuccessededStudents: exams.filter(exam => exam.grade >= 50).length,
            totalFailedStudents: exams.filter(exam => exam.grade < 50).length,
            totalStudents: exams.length,
            averageGrade: exams.reduce((total, exam) => total + exam.grade, 0) / exams.length,
            attened: studentsAttendedExam,
            notAttended: notAttendedStudents,
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error getting exams' });
    }
});