const expressAsyncHandler = require("express-async-handler");
const { Lecture_Exam, Student, Lecture, Group } = require("../models/");
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

exports.getAllStudentsWithGrades = expressAsyncHandler(async (req, res) => {
  const { groupId ,lectureId} = req.query;
  console.log(groupId,lectureId);
  
  // get the lecture 
  let lecture = await Lecture.findOne({ where: { id: lectureId } });

  // get all the lecture exams 
  const exams = await Lecture_Exam.findAll({ where: { lecture_id: lecture.id } });

  // get all the students
  const students = await Student.findAll({ where: { group_id: groupId } ,include:[Group]});

  // Convert students to plain objects
  const plainStudents = students.map(student => ({...student.toJSON(),grade:null}));

  // Add the grades to the students
  for (let i = 0; i < plainStudents.length; i++) {
    for (let j = 0; j < exams.length; j++) {
      if (plainStudents[i].id == exams[j].student_id) {
        plainStudents[i].grade = exams[j].grade;
        break; // Exit the loop if a grade is found
      } else {
        plainStudents[i].grade = null;
      }
    }
  }

  res.status(200).json(plainStudents);
})