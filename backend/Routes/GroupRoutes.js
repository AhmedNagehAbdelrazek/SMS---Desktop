const express = require("express");
const router = express.Router();
const groupController = require("../controllers/GroupController");

// Routes for Group CRUD operations
router.get("/", groupController.getGroups);          // Get all groups
router.get("/:id", groupController.getGroupById);    // Get a specific group by ID
router.post("/", groupController.createGroup);       // Create a new group
router.patch("/:id", groupController.updateGroup);     // Update an existing group by ID
router.delete("/:id", groupController.deleteGroup);  // Delete a group by ID

router.get("/students/:id",groupController.getAllGroupStudents);
router.get("/week/table",groupController.getWeekGroupsTable);

router.get("/ordered/today",groupController.getOrderedGroupsOnly);

module.exports = router;
