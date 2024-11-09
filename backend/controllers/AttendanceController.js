const asyncHandler = require("express-async-handler");
const { Attendance, Lecture, Student } = require("../models");
const { getLastLectureId } = require("../utils/Group");

exports.attend = asyncHandler(async (req, res) => {
    const { studentId, groupId } = req.body;
    const student = await Student.findOne({ where: { id:studentId, isDeleted: false , group_id: groupId} });
    if(!student) {
        return res.status(404).json({ message: "Student not found." });
    }
    const hasAttended = await Attendance.findOne({ where: { student_id: studentId , isDeleted:false} });
    if(hasAttended) {
        return res.status(400).json({ message: "Student has already attended." });
    }
    const lectureId = await getLastLectureId(groupId);
    console.log(lectureId,studentId);

    await Attendance.create({
        student_id: studentId,
        lecture_id: lectureId,
        attended:true
    });
    res.status(200).json({ message: "Student attendance recorded." });
});

exports.getAllAttendances = asyncHandler(async (req, res) => {
    const attendances = await Attendance.findAll({
        include: [Lecture, Student],
        where: { isDeleted: false },
    });
    res.status(200).json(attendances);
});

// exports.getAllAttendancesForGroup = asyncHandler(async (req, res) => {
//     const { groupId } = req.params;
//     // const attendances = await Attendance.findAll({ include: [Lecture, Student], where: { isDeleted: false } });
//     const allLectures = await Lecture.findAll({ where: { group_id: groupId } });
//     const attendances = await Promise.all(
//         allLectures.map(async (lecture) => {
//             const attendance = await Attendance.findAll({
//                 where: { lecture_id: lecture.id, isDeleted: false },
//             });
//             const notAttended = await Student.findAll({
//                 where: {
//                     group_id: groupId,
//                     isDeleted: false,
//                 },
//                 include: [
//                     {
//                         Lecture,
//                         include: [Attendance],
//                     },
//                 ],
//             });
//             return { lecture, attendance, notAttended: notAttended };
//         })
//     );

//     res.status(200).json(attendances);
// });

exports.getAllAttendancesForGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    // Get all students in the specified group
    const allStudents = await Student.findAll({
        where: { group_id: groupId, isDeleted: false },
    });

    // Get all lectures for the specified group
    const allLectures = await Lecture.findAll({
        where: { group_id: groupId, isDeleted: false },
    });

    // Fetch all attendance records for the lectures in the group
    const attendanceRecords = await Attendance.findAll({
        where: {
            lecture_id: allLectures.map(lecture => lecture.id),
            isDeleted: false,
        },
        include: [{ model: Student, attributes: ['id', 'name'] }],
    });

    // Group attendance by lecture
    const lectureAttendance = allLectures.map(lecture => {
        // Get attended students for this lecture
        const attendedStudents = attendanceRecords
            .filter(att => att.lecture_id === lecture.id)
            .map(att => att.Student);

        // Get not-attended students by excluding those in attendedStudents
        const notAttendedStudents = allStudents.filter(
            student => !attendedStudents.includes(student.id)
        );

        return {
            lecture: lecture.name,
            attended: attendedStudents,
            notAttended: notAttendedStudents,
        };
    });

    res.status(200).json(lectureAttendance);
});

exports.getAllAttendancesForLecture = asyncHandler(async (req, res) => {
    const { lectureId } = req.params;

    // Find the lecture by its ID
    const lecture = await Lecture.findByPk(lectureId);
    if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
    }

    // Get all attendance records for the lecture
    const attendanceRecords = await Attendance.findAll({
        where: { lecture_id: lectureId, isDeleted: false },
        include: [{ model: Student, attributes: ['id', 'name'] }],
    });

    // Extract IDs of students who attended
    const attendedStudentIds = attendanceRecords.map(record => record.student_id);

    // Get all students in the group, and filter for non-attended
    const allStudents = await Student.findAll({
        where: { group_id: lecture.group_id, isDeleted: false },
        attributes: ['id', 'name'],
    });

    const notAttendedStudents = allStudents.filter(
        student => !attendedStudentIds.includes(student.id)
    );

    // Prepare response with attended and not attended students
    const response = {
        lecture: lecture.name,
        attended: attendanceRecords.map(record => ({
            id: record.student_id,
            name: record.Student.name,
        })),
        notAttended: notAttendedStudents,
    };

    res.status(200).json(response);
});


exports.deleteAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.findByPk(req.params.id);
    if (!attendance) {
        return res.status(404).json({ message: "Attendance not found" });
    }
    await attendance.update({ isDeleted: true });
    res.status(200).json({ message: "Attendance deleted successfully" });
});
