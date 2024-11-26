const asyncHandler = require("express-async-handler");
const {
  Student,
  Group,
  Lecture_Exam,
  Attendance,
  Lecture,
  Exam,
  Month_Exam,
} = require("../models/index");
const upload = require("../config/uploadAvatars");
const { Op } = require("sequelize");
const { getLastLectureId } = require("../utils/Group");

async function deleteImage(imagePath) {
  if (require("fs").existsSync(imagePath)) {
    await new Promise((resolve, reject) => {
      require("fs").unlink(imagePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
          console.log("Avatar deleted successfully");
        }
      });
    });
  }
}

exports.addStudent = [
  upload.single("avatar"), // Handle single file upload with "avatar" as the field name
  asyncHandler(async (req, res) => {
    try {
      const body = req.body;
      const group_id = body.group_id;

      // Validate group_id
      if (group_id) {
        const group = await Group.findByPk(group_id);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
          // throw { message: "Group not found" };
        }
      }

      // Handle avatar file if uploaded
      // const baseUrl = `${req.protocol}://${req.get("host")}`; // Get the base URL dynamically
      const avatarPath = req.file
        ? `/uploads/avatars/${req.file.filename}`
        : null;

      if (Array.isArray(body)) {
        // Bulk create students
        const students = await Student.bulkCreate(
          body.map((student) => ({
            ...student,
            avatar: avatarPath, // Assign avatar path if applicable
          }))
        );

        return res.status(200).json(students);
      }

      // Single student creation
      const newStudent = await Student.create({
        ...body,
        avatar: avatarPath,
      });

      return res.status(200).json(newStudent);
    } catch (error) {
      // console.error(req.file.path);
      await deleteImage(req?.file?.path);
      throw error;
    }
  }),
];

// exports.getAllStudents = asyncHandler(async (req, res) => {
//     // Default values for pagination
//     const page = parseInt(req.query.page) || 1; // Default to 1 if no page is provided
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
//     const all = req.query.all;
//     const search = req.query.search;
//     const deleted = req.query.deleted;

//     if(all == "true"){
//         const students = await Student.findAll({where:{
//             [Op.or]: [
//                 { isDeleted: false },
//                 { isDeleted: deleted == "true" ? true : false }
//             ]
//         },include:[{
//             model: Group,
//             attributes: ['name',"id"]
//         }]
//     });
//         return res.status(200).json(students);
//     }

//     // Calculate the offset for pagination
//     const offset = (page - 1) * limit;

//     try {
//         // Fetch the students with pagination
//         let students = null;
//         if(search){
//             students = await Student.findAll({
//                 where: {
//                     [Op.or]: [
//                         { name: { [Op.like]: `%${search}%` } },
//                         { phone_number: { [Op.like]: `%${search}%` } }, // Correct column name
//                         { id: { [Op.like]: `%${search}%` } },
//                     ],
//                     [Op.and]:[
//                         { isDeleted: false },
//                         { isDeleted: deleted == "true" ? true : false }
//                     ]
//                 },include:[{
//                     model: Group,
//                     attributes: ['name',"id"]
//                 }]
//             });
//         }else{
//             students = await Student.findAll({
//                 offset: offset,
//                 limit: limit,
//                 where:{
//                     [Op.or]: [
//                         { isDeleted: false },
//                         { isDeleted: deleted == "true" ? true : false }
//                     ]
//                 },include:[{
//                     model: Group,
//                     attributes: ['name',"id"]
//                 }]
//             });
//         }

//         // Get the total count of students to calculate total pages
//         const totalCount = await Student.count();

//         // Calculate total pages based on the total count and limit
//         const totalPages = Math.ceil(totalCount / limit);

//         // Send the paginated response
//         return res.status(200).json({
//             currentPage: page,
//             totalPages: totalPages,
//             totalCount: totalCount,
//             students: students,
//             limit
//         });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// });

exports.getAllStudents = asyncHandler(async (req, res) => {
  // Extract query parameters
  const {
    page = 1,
    limit = 10,
    all,
    search,
    deleted,
    blocked,
    attended,
    sortBy = "id", // Default sort by ID
    sortOrder = "ASC", // Default sort order
  } = req.query;

  // Determine whether to fetch all students or apply pagination
  const fetchAll = all === "true";

  // Construct the `where` condition based on filters
  const whereConditions = {
    [Op.and]: [
      deleted === "true" ? {} : { isDeleted: false },
      blocked ? { blocked: blocked === "true" } : {},
    ],
  };

  // Add search filter if provided
  if (search) {
    whereConditions[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
      { id: { [Op.like]: `%${search}%` } },
    ];
  }

  // Sorting configuration
  const order = [[sortBy, sortOrder.toUpperCase()]];

  try {
    // Fetch all students if `all` is true
    if (fetchAll) {
      const students = await Student.findAll({
        where: whereConditions,
        include: [
          {
            model: Group,
            attributes: ["name", "id"],
          },
        ],
        order,
      });
      // Add attendance filter if provided
    let studentAttendance = [];
    if (attended) {
      studentAttendance = await Promise.all(
        students.map(async (student) => {
          const studentId = student.id;
          const hasAttended = await Attendance.findOne({
            where: {
              student_id: studentId,
              isDeleted: false,
            },
            order: [["createdAt", "DESC"]],
          });
          if (hasAttended) {
            return {
              ...student.toJSON(),
              hasAttended: true,
            };
          } else {
            return {
              ...student.toJSON(),
              hasAttended: false,
            };
          }
        })
      );
    }

      return res.status(200).json(studentAttendance);
    }

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Fetch students with pagination
    const students = await Student.findAll({
      where: whereConditions,
      include: [
        {
          model: Group,
          attributes: ["name", "id"],
        },
      ],
      order,
      offset,
      limit,
    });

    // Get the total count for pagination metadata
    const totalCount = await Student.count({ where: whereConditions });
    const totalPages = Math.ceil(totalCount / limit);

    // Add attendance filter if provided
  let studentAttendance = [];
  if (attended) {
    studentAttendance = await Promise.all(
      students.map(async (student) => {
        const studentId = student.id;

        let hasAttended = false;
        if (student.group_id) {
            let lastLectureId = await getLastLectureId(student.group_id);
            hasAttended = await Attendance.findOne({
              where: {
                student_id: studentId,
                lecture_id: lastLectureId,
                isDeleted: false,
              },
              order: [["createdAt", "DESC"]],
            });
        }
        
        if (hasAttended) {
          return {
            ...student.toJSON(),
            hasAttended: true,
          };
        } else {
          return {
            ...student.toJSON(),
            hasAttended: false,
          };
        }
      })
    );
  }

    // Send the paginated response
    return res.status(200).json({
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      students: studentAttendance,
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching students:", error.message);
    return res
      .status(500)
      .json({
        message: "An error occurred while fetching students.",
        error: error.message,
      });
  }
});

exports.getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const student = await Student.findByPk(id);

  let attendance = await Attendance.findAll({
    where: {
      student_id: student.id,
      isDeleted: false,
    },
    limit: 2,
    order: [["createdAt", "DESC"]],
  });

  if (!student) {
    // throw { message: 'Student not found' };
    return res.status(404).json({ message: "Student not found" });
  }

  return res.status(200).json({ ...student.toJSON(), attendance });
});

exports.updateStudent = [
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const student = await Student.findByPk(id);

      if (!student) {
        throw { message: "Student not found" };
      }

      let avatar = req.file;

      if (avatar && student.avatar) {
        // delete the old avatar
        let avatarPath = student.avatar.split("/");
        avatarPath = avatarPath[avatarPath.length - 1];
        avatarPath = require("path").join(
          __dirname,
          "..",
          "uploads",
          "avatars",
          avatarPath
        );
        await deleteImage(avatarPath);
      }

      // const baseUrl = `${req.protocol}://${req.get("host")}`; // Get the base URL dynamically
      const avatarPath = req.file
        ? `/uploads/avatars/${req.file.filename}`
        : null;

      if (avatarPath) {
        body.avatar = avatarPath;
      }
      const updatedStudent = await student.update({
        ...body,
      });

      return res.status(200).json(updatedStudent);
    } catch (error) {
      await deleteImage(req?.file?.path);
      throw error;
    }
  }),
];

exports.deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByPk(id);

  if (!student) {
    // throw {message:'Student not found'}
    return res.status(404).json({ message: "Student not found" });
  }

  await student.update({ isDeleted: true });
  return res.status(200).json({ message: "Student deleted successfully" });
});

exports.chnageGroup = asyncHandler(async (req, res) => {
  const { id: group_id } = req.params;
  const { student_id } = req.body;

  const student = await Student.findByPk(student_id);
  const group = await Group.findByPk(group_id);
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }
  if (!group) {
    // throw { message: 'Group not found' };
    return res.status(404).json({ message: "Group not found" });
  }
  const updatedStudent = await student.update({ group_id });
  return res.status(200).json(updatedStudent);
});

exports.analyzeStudentPerformance = asyncHandler(async (req, res) => {
  const { id: studentId } = req.params;

  try {
    // Step 1: Fetch attendance records for the student
    const attendanceRecords = await Attendance.findAll({
      where: { student_id: studentId, attended: true, isDeleted: false },
      include: {
        model: Lecture,
        attributes: ["id", "name", "lecture_number", "group_id"],
        include: {
          model: Group,
          attributes: ["id", "name"],
        },
      },
    });

    let lecturesReport = [];
    let overallLectureGrade = 0;
    let overallHomeworkGrade = 0;

    if (attendanceRecords && attendanceRecords.length > 0) {
      // Fetch grades for attended lectures
      const lectureIds = attendanceRecords.map((record) => record.Lecture.id);
      const grades = await Lecture_Exam.findAll({
        where: {
          student_id: studentId,
          lecture_id: lectureIds,
          isDeleted: false,
        },
        attributes: ["lecture_id", "grade"],
      });

      // Map grades to lectures
      const gradesMap = grades.reduce((map, gradeRecord) => {
        map[gradeRecord.lecture_id] = gradeRecord.grade;
        return map;
      }, {});

      // Calculate overall grades
      const totalLectureGrades = grades.reduce(
        (sum, record) => sum + record.grade,
        0
      );
      overallLectureGrade = (totalLectureGrades / lectureIds.length).toFixed(2);

      const totalHomeworkGrades = attendanceRecords.reduce((sum, record) => {
        return sum + (parseInt(record.homework_type, 10) || 0);
      }, 0);
      overallHomeworkGrade = (
        totalHomeworkGrades / attendanceRecords.length
      ).toFixed(2);

      // Generate lectures report
      lecturesReport = attendanceRecords.map((record) => {
        const grade = gradesMap[record.Lecture.id] || 0;
        return {
          id: record.Lecture.id,
          name: record.Lecture.name,
          lecture_number: record.Lecture.lecture_number,
          group: record.Lecture.Group,
          attended: record.attended,
          isCompensatory: record.isCompensatory || false,
          homeworkType: record.homework_type || "N/A",
          lectureGrade: grade,
        };
      });
    }

    // Step 2: Fetch monthly exam grades
    const monthExams = await Exam.findAll({
      where: { student_id: studentId, isDeleted: false },
      include: {
        model: Month_Exam,
        attributes: ["id", "name", "date"],
      },
    });

    let monthExamReport = [];
    let overallMonthGrade = 0;

    if (monthExams && monthExams.length > 0) {
      const totalMonthGrades = monthExams.reduce(
        (sum, exam) => sum + (exam.grade || 0),
        0
      );
      overallMonthGrade = (totalMonthGrades / monthExams.length).toFixed(2);

      monthExamReport = monthExams.map((exam) => ({
        id: exam.Month_Exam.id,
        name: exam.Month_Exam.name,
        date: exam.Month_Exam.date,
        grade: exam.grade || 0,
      }));
    }

    // Step 3: Respond with the performance analysis
    return res.status(200).json({
      studentId,
      overallLectureGrade,
      overallHomeworkGrade,
      overallMonthGrade,
      lecturesReport,
      monthExamReport,
    });
  } catch (error) {
    console.error("Error analyzing student performance:", error.message);
    res
      .status(500)
      .json({
        message: "Failed to analyze student performance.",
        error: error.message,
      });
  }
});
