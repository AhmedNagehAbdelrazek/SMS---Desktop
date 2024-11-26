const asyncHandler = require("express-async-handler");
const { Attendance, Lecture, Student } = require("../models");
const { getLastLectureId } = require("../utils/Group");

exports.attend = asyncHandler(async (req, res) => {
    const { studentId, groupId ,homework } = req.body;
    
    const student = await Student.findOne({ where: { id:studentId, isDeleted: false } });
    if(!student) {
        return res.status(404).json({ message: "Student not found." });
    }

    //TODO check if student has already attended and wants to attend to another group send a different message
    let gId = groupId || student.group_id;
    console.log(gId);
    const lectureId = await getLastLectureId(gId);

    const hasAttended = await Attendance.findOne({ where: { student_id: studentId , isDeleted:false} });
    if(hasAttended && groupId && student.group_id != groupId) {
        let attendance = await Attendance.create({
            student_id: studentId,
            lecture_id: lectureId,
            homework_type:homework,
            isCompensatory:true,
            attended:true
        });
        return res.status(200).json({ message: "this Student has already attended this lecture in his group." ,attendance});
    }

    if(hasAttended && student.group_id == groupId) {
        return res.status(400).json({ message: "Student has already attended in his group." });
    }
    
    let attendance = null;
    if(groupId && student.group_id != groupId) {
        // check if student is not in the group that means he attended a Compensatory lecture
        attendance = await Attendance.create({
            student_id: studentId,
            lecture_id: lectureId,
            homework_type:homework,
            isCompensatory:true,
            attended:true
        });
    }else if(student.group_id == groupId || groupId == null) {
        // check if student is in the group that means he attended a lecture
        attendance = await Attendance.create({
            student_id: studentId,
            lecture_id: lectureId,
            homework_type:homework,
            attended:true
        });
    }else{
        attendance = await Attendance.create({
            student_id: studentId,
            lecture_id: lectureId,
            homework_type:homework,
            attended:true
        });
    }

    res.status(200).json({ message: "Student attendance recorded." ,attendance});
});
exports.getAttend = asyncHandler(async (req, res) => {
    const { attendId } = req.params;

    const attendance = await Attendance.findByPk(attendId);
    if(!attendance) {
        return res.status(404).json({ message: "Attendance not found." });
    }
    res.status(200).json(attendance);
})
exports.getAllAttendances = asyncHandler(async (req, res) => {
    const attendances = await Attendance.findAll({
        include: [Lecture, Student],
        where: { isDeleted: false },
    });
    res.status(200).json(attendances);
});

exports.updateAttendanceHomework = asyncHandler(async(req,res)=>{
    const { homework } = req.body;
    const {id:attendanceId} = req.params;

    const attendance = await Attendance.findByPk(attendanceId);
    if(!attendance) {
        return res.status(404).json({ message: "Attendance not found." });
    }
    attendance.homework_type = parseInt(homework);
    await attendance.save();

    res.status(200).json({ message: "Attendance updated." ,attendance});
})

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
        attributes: ['id','homework_type','attended'],
        include: [{ model: Student, attributes: ['id', 'name'] }],
    });

    // Extract IDs of students who attended
    const attendedStudentIds = attendanceRecords.map(record => record.Student.id);

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
        attended: attendanceRecords,
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
