const expressAsyncHandler = require("express-async-handler");
const { Lecture_Exam, Student, Lecture } = require("../models/");
const { getLastLectureId } = require("../utils/Group");

exports.setLectureExamGrade = expressAsyncHandler(async (req, res) => {
  const { studentId, grade, groupId ,lectureId } = req.body;

  // get the last lecture ID for the group to create a new exam for the student in the group
  let lecture_Id = lectureId || await getLastLectureId(groupId);

  // Check if student exists
  const isStudentGroup = await Student.findOne({ where: { id: studentId, group_id: groupId } });
  if (!isStudentGroup) {
    let lecture = await Lecture.findOne({ where: { id: lecture_Id } });
    if(lecture.group_id != groupId){
      return res.status(400).json({ message: "Student not in the group" });
    }
  }

  // Check if grade already exists for the student in the group for the last lecture ID
  const existingGrade = await Lecture_Exam.findOne({ where: { student_id: studentId, lecture_id: lecture_Id } });
  if (existingGrade) {
    return res.status(400).json({ message: "Grade already exists" });
  }
  // Create or update the grade for the student in the group for the last lecture ID
  const examGrade = await Lecture_Exam.create({
    student_id: studentId,
    lecture_id: lecture_Id,
    grade,
  });
  res.status(200).json({ message: "Grade updated", examGrade });

});

exports.updateLectureExamGrade = expressAsyncHandler(async (req, res) => {
  // Check if student exists
  const { studentId, grade, examId } = req.body;

  // Check if grade already exists for the student in the group for the last lecture ID
  const existingGrade = await Lecture_Exam.findOne({ where: { student_id: studentId, id: examId } });
  if (!existingGrade) {
    return res.status(400).json({ message: "Grade not found" });
  }
  // Create or update the grade for the student in the group for the last lecture ID
  const examGrade = await Lecture_Exam.update({ grade }, { where: { id: examId } });
  res.status(200).json({ message: "Grade updated", examGrade });

});
