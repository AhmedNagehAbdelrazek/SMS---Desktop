const sequelize = require('../config/database');
const Attendance = require('./Attendance');
const Exam = require('./Exam');
const Group = require('./Group');
const Lecture = require('./Lecture');
const Lecture_Exam = require('./Lecture_Exam');
const Month_Exam = require('./Month_exam');
const Student = require('./Student');

// Set up one-to-many relationships
Student.hasMany(Attendance, { foreignKey: 'student_id' });
Attendance.belongsTo(Student, { foreignKey: 'student_id' });

Group.hasMany(Student, { foreignKey: 'group_id' });
Student.belongsTo(Group, { foreignKey: 'group_id' });

Student.hasMany(Exam, { foreignKey: 'student_id' });
Exam.belongsTo(Student, { foreignKey: 'student_id' });

Student.hasMany(Lecture_Exam, { foreignKey: 'student_id' });
Lecture_Exam.belongsTo(Student, { foreignKey: 'student_id' });

Group.hasMany(Lecture, { foreignKey: 'group_id' });
Lecture.belongsTo(Group, { foreignKey: 'group_id' });

Lecture.hasMany(Attendance, { foreignKey: 'lecture_id' });
Attendance.belongsTo(Lecture, { foreignKey: 'lecture_id' });

Group.hasMany(Month_Exam, { foreignKey: 'group_id' });
Month_Exam.belongsTo(Group, { foreignKey: 'group_id' });

Month_Exam.hasMany(Exam, { foreignKey: 'month_exam_id' });
Exam.belongsTo(Month_Exam, { foreignKey: 'month_exam_id' });

// Optional: Define Lecture-Exam many-to-many relationship, if applicable
Lecture.belongsToMany(Exam, { through: Lecture_Exam, foreignKey: 'lecture_id' });
Exam.belongsToMany(Lecture, { through: Lecture_Exam, foreignKey: 'exam_id' });

// Export modules for use in other parts of the application
module.exports = {
    sequelize,
    Student,
    Group,
    Lecture,
    Attendance,
    Lecture_Exam,
    Month_Exam,
    Exam
};
