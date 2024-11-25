const asyncHandler = require("express-async-handler");
const Group = require("../models/Group");
const { days } = require("../config/consts");
const { Attendance } = require("../models");

// Get all groups
exports.getGroups = asyncHandler(async (req, res) => {
    const groups = await Group.findAll();
    res.status(200).json(groups);
});

// Get a single group by ID
exports.getGroupById = asyncHandler(async (req, res) => {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
});

// Create a new group
exports.createGroup = asyncHandler(async (req, res) => {
    const { name, day_of_week, time_of_day, period } = req.body;
    const newGroup = await Group.create({ name, day_of_week, time_of_day, period });
    res.status(201).json(newGroup);
});

// Update an existing group by ID
exports.updateGroup = asyncHandler(async (req, res) => {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    const { name, last_lecture_number, group_date } = req.body;
    await group.update({ name, last_lecture_number, group_date });
    res.status(200).json(group);
});

// Delete a group by ID
exports.deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    await group.update({ isDeleted: true });
    res.status(200).json({ message: "Group deleted successfully" });
});

exports.getAllGroupStudents = asyncHandler(async (req, res) => {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId);
    if (!group) {
        return res.status(404).json({ message: "Group not found" });
    }
    let students = await group.getStudents();

    let studentsWithAttendance = await Promise.all(
        students.map(async (student) => {
            let attendance = await Attendance.findAll({
                where: {
                    student_id: student.id,
                    isDeleted: false,
                },
            });
            // return the student and the attendance in the same object 
            return {
                // add all student values
                ...student.toJSON(),
                attendance,
            };
        })
    )

    res.status(200).json(studentsWithAttendance);
});

exports.getWeekGroupsTable = asyncHandler(async (req, res) => {
    // Fetch all groups, including necessary fields
    const groups = await Group.findAll({
        where: { isDeleted: false }, // Exclude deleted groups
        attributes: ["id", "name", "day_of_week", "time_of_day", "period"],
    });

    // Predefined weekdays in the correct order
    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    // Helper function to convert time strings to Date objects
    const parseTime = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        return date;
    };

    // Helper function to format time as "HH:mm AM/PM"
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes.toString().padStart(2, "0");
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    // Create the week groups table
    const weekGroups = weekdays.map((day, index) => {
        // Filter groups for the current day
        const dayGroups = groups
            .filter((group) => group.day_of_week === index + 1)
            .map((group) => {
                const startTime = parseTime(group.time_of_day);
                const endTime = new Date(startTime.getTime() + group.period * 60 * 60 * 1000); // Calculate end time

                return {
                    id: group.id,
                    name: group.name,
                    start_time: formatTime(startTime),
                    end_time: formatTime(endTime),
                };
            })
            .sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time)); // Sort by start time

        return { day, groups: dayGroups };
    });

    return res.status(200).json(weekGroups);
});

// exports.getOrderedGroupsByDay = asyncHandler(async (req, res) => {
//     // Fetch all groups, including necessary fields
//     const groups = await Group.findAll({
//         where: { isDeleted: false }, // Exclude deleted groups
//         attributes: ["id", "name", "day_of_week", "time_of_day", "period"],
//     });

//     // Predefined weekdays in the correct order
//     const weekdays = [
//         "Sunday",
//         "Monday",
//         "Tuesday",
//         "Wednesday",
//         "Thursday",
//         "Friday",
//         "Saturday",
//     ];

//     // Get today's index (0 for Sunday, 6 for Saturday)
//     const todayIndex = new Date().getDay();

//     // Rearrange weekdays to start from today
//     const orderedWeekdays = [
//         ...weekdays.slice(todayIndex),
//         ...weekdays.slice(0, todayIndex),
//     ];

//     // Helper function to parse time strings to Date objects
//     const parseTime = (timeString) => {
//         const [hours, minutes, seconds] = timeString.split(":").map(Number);
//         const date = new Date();
//         date.setHours(hours, minutes, seconds);
//         return date;
//     };

//     // Helper function to format time as "HH:mm AM/PM"
//     const formatTime = (date) => {
//         const hours = date.getHours();
//         const minutes = date.getMinutes();
//         const ampm = hours >= 12 ? "PM" : "AM";
//         const formattedHours = hours % 12 || 12;
//         const formattedMinutes = minutes.toString().padStart(2, "0");
//         return `${formattedHours}:${formattedMinutes} ${ampm}`;
//     };

//     // Map ordered weekdays to groups
//     const orderedGroups = orderedWeekdays.map((day, index) => {
//         const dayIndex = (todayIndex + index) % 7; // Match current day's index in the original weekdays array
//         const dayGroups = groups
//             .filter((group) => group.day_of_week === dayIndex + 1)
//             .map((group) => {
//                 const startTime = parseTime(group.time_of_day);
//                 const endTime = new Date(
//                     startTime.getTime() + group.period * 60 * 60 * 1000
//                 ); // Calculate end time

//                 return {
//                     id: group.id,
//                     name: group.name,
//                     start_time: formatTime(startTime),
//                     end_time: formatTime(endTime),
//                 };
//             })
//             .sort((a, b) => parseTime(a.start_time) - parseTime(b.start_time)); // Sort by start time

//         return { day, groups: dayGroups };
//     });

//     return res.status(200).json(orderedGroups);
// });

exports.getOrderedGroupsOnly = asyncHandler(async (req, res) => {
    const today = new Date().getDay(); // Current day index (0 for Sunday, 1 for Monday, ..., 6 for Saturday)

    // Fetch all groups
    const groups = await Group.findAll({
        where: { isDeleted: false },
        attributes: ["id", "name", "day_of_week", "time_of_day", "period"],
    });

    // Helper function to calculate day difference (for ordering)
    const calculateDayOrder = (groupDay) => {
        return (groupDay - today + 7) % 7; // Wrap around to ensure order starts from today
    };

    // Sort groups:
    const orderedGroups = groups
        .map((group) => ({
            id: group.id,
            name: group.name,
            day_of_week: group.day_of_week,
            day: days[group.day_of_week],
            time_of_day: group.time_of_day,
            period: group.period,
        }))
        .sort((a, b) => {
            // Compare by day of week (relative to today)
            const dayOrderA = calculateDayOrder(a.day_of_week);
            const dayOrderB = calculateDayOrder(b.day_of_week);

            if (dayOrderA !== dayOrderB) {
                return dayOrderA - dayOrderB;
            }

            // If same day, compare by time
            return a.time_of_day.localeCompare(b.time_of_day);
        });

    // Return the sorted groups
    return res.status(200).json(orderedGroups);
});
