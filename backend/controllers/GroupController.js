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
    const { name, day_of_week,time_of_day } = req.body;
    const newGroup = await Group.create({ name, day_of_week ,time_of_day});
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
    await group.destroy();
    res.status(200).json({ message: "Group deleted successfully" });
});
