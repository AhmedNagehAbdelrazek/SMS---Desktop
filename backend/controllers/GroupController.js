const asyncHandler = require("express-async-handler");
const Group = require("../models/Group");

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
    const students = await group.getStudents();

    res.status(200).json(students);
});

exports.getWeekGroupsTable = asyncHandler(async (req, res) => {
    // Fetch all groups, including necessary fields
    const groups = await Group.findAll({
        where: { isDeleted: false }, // Exclude deleted groups
        attributes: ["id", "name", "day_of_week", "time_of_day", "period"],
    });

    // Helper function to convert 12-hour time to a sortable format (24-hour)
    const convertTo24Hour = (time) => {
        const [hours, modifier] = time.match(/^(\d+)(AM|PM)$/).slice(1, 3);
        let hour = parseInt(hours, 10);
        if (modifier === "PM" && hour !== 12) hour += 12;
        if (modifier === "AM" && hour === 12) hour = 0;
        return hour;
    };

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

    // Create the week groups table
    const weekGroups = weekdays.map((day) => {
        // Filter groups for the current day
        const dayGroups = groups
            .filter((group) => group.day_of_week === day)
            .map((group) => ({
                id: group.id,
                name: group.name,
                start_time: group.time_of_day,
                end_time: `${(convertTo24Hour(group.time_of_day) + group.period) % 12 || 12}${convertTo24Hour(group.time_of_day) + group.period >= 12 ? "PM" : "AM"}`, // Calculate end time
            }))
            .sort((a, b) => convertTo24Hour(a.start_time) - convertTo24Hour(b.start_time)); // Sort by start time

        return { day, groups: dayGroups };
    });

    return res.status(200).json(weekGroups);
});