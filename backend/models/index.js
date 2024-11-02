const sequelize = require('../config/database');
const Attendance = require('./Attendance');
const Exam = require('./Exam');
const Group = require('./Group');
const Lecture = require('./Lecture');
const Lecture_Exam = require('./Lecture_exam');
const Month_Exam = require('./Month_exam');
const Student = require('./Student');

Student.hasMany(Attendance);
Attendance.belongsTo(Student);

Group.hasMany(Student,{foreignKey: 'group_id'});
Student.belongsTo(Group,{foreignKey:"group_id"});

Student.hasMany(Exam);
Exam.belongsTo(Student);

Student.hasMany(Lecture_Exam);
Lecture_Exam.belongsTo(Student);

Group.hasMany(Lecture);
Lecture.belongsTo(Group);

Lecture_Exam.hasMany(Lecture);
Lecture.belongsTo(Lecture_Exam);

Lecture.hasMany(Attendance);
Attendance.belongsTo(Lecture);

Group.hasMany(Month_Exam);
Month_Exam.belongsTo(Group);

Month_Exam.hasMany(Exam);
Exam.belongsTo(Month_Exam);

module.exports = {
    sequelize,
    Student,
    Group,
    Lecture,
    Attendance,
    Lecture_Exam,
    Month_Exam,
    Exam
}