const router = require("express").Router();
const studentRoutes = require("./StudentsRoutes");
const groupRoutes = require("./GroupRoutes");

router.use("/student",studentRoutes);
router.use("/group",groupRoutes);


module.exports = router;