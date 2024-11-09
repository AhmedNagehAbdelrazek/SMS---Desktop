const expressAsyncHandler = require('express-async-handler');
const { Student, Group } = require('../models');
const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');
const { getLastLectureId } = require('../utils/Group');

//! Test it
exports.groupAttendanceReport = expressAsyncHandler(async (req, res) => {
    const { groupId } = req.query;
    const lectureId = getLastLectureId(groupId);
    try {
        const attended = await Attendance.findAll({
            where: { groupId, lectureId },
            include: { model: Student, attributes: ['name'] }
        });
        const notAttended = await Student.findAll({
            include: [
                {
                    model: Group,
                    where: { id: groupId }, 
                    through: { attributes: [] }, 
                },
                {
                    model: Attendance,
                    where: {
                        lectureId: lectureId, 
                    },
                    required: false, 
                    attributes: [] 
                }
            ],
            where: {
                '$Attendances.lectureId$': null, // Ensure no attendance record for the lecture
            },
            attributes: ['id', 'name']
        });

        const report = {
            attended:attended,
            notAttended:notAttended
        };
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching group attendance' });
    }
});

exports.dailyAttendanceReport = expressAsyncHandler(async (req, res) => {
    const { groupId, date } = req.query;
    try {
        const attended = await Attendance.findAll({
            where: {
                groupId,
                date: { [Op.between]: [new Date(date), new Date(date).setHours(23, 59, 59)] }
            },
            include: { model: Student, attributes: ['name'] }
        });
        const numberOfStudents = await Student.count({ where: { groupId } });
        const report = {attended,numberOfStudents};

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching daily report' });
    }
});
