const asyncHandler = require("express-async-handler");
const { Student, Group, Lecture_Exam, Attendance, Lecture } = require("../models/index");
const upload = require("../config/uploadAvatars");
const { Op } = require("sequelize");

async function deleteImage(imagePath) {
    if (require('fs').existsSync(imagePath)) {
        await new Promise((resolve, reject) => {
            require('fs').unlink(imagePath, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                    console.log("Avatar deleted successfully");
                }
            });
        });
    }
};

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
            const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;

            if (Array.isArray(body)) {
                // Bulk create students
                const students = await Student.bulkCreate(
                    body.map(student => ({
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

exports.getAllStudents = asyncHandler(async (req, res) => {
    // Default values for pagination
    const page = parseInt(req.query.page) || 1; // Default to 1 if no page is provided
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const all = req.query.all;
    const search = req.query.search;
    const deleted = req.query.deleted;

    if(all == "true"){
        const students = await Student.findAll({where:{
            [Op.or]: [
                { isDeleted: false },
                { isDeleted: deleted == "true" ? true : false }
            ]
        }});
        return res.status(200).json(students);
    }

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    try {
        // Fetch the students with pagination
        let students = null;
        if(search){
            students = await Student.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { phone_number: { [Op.like]: `%${search}%` } }, // Correct column name
                        { id: { [Op.like]: `%${search}%` } },
                        { isDeleted: false },
                        { isDeleted: deleted == "true" ? true : false }
                    ],
                    
                },
            });
        }else{
            students = await Student.findAll({
                offset: offset,
                limit: limit,
                where:{
                    [Op.or]: [
                        { isDeleted: false },
                        { isDeleted: deleted == "true" ? true : false }
                    ]
                }
            });
        }

        // Get the total count of students to calculate total pages
        const totalCount = await Student.count();

        // Calculate total pages based on the total count and limit
        const totalPages = Math.ceil(totalCount / limit);

        // Send the paginated response
        return res.status(200).json({
            currentPage: page,
            totalPages: totalPages,
            totalCount: totalCount,
            students: students,
            limit
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


exports.getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
        // throw { message: 'Student not found' };
        return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json(student);
});

exports.updateStudent = [
    upload.single("avatar"),
    asyncHandler(async (req, res) => {
        try{
            const { id } = req.params;
            const body = req.body;
            const student = await Student.findByPk(id);
    
            if (!student) {
                throw { message: 'Student not found' };
            }

            let avatar = req.file;
            
            if (avatar && student.avatar) {
                // delete the old avatar
                let avatarPath = student.avatar.split('/');
                avatarPath = avatarPath[avatarPath.length - 1];
                avatarPath = require('path').join(__dirname, "..", 'uploads', 'avatars', avatarPath);
                await deleteImage(avatarPath);
            }
    
            // const baseUrl = `${req.protocol}://${req.get("host")}`; // Get the base URL dynamically
            const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    
            if(avatarPath){
                body.avatar = avatarPath;
            }
            const updatedStudent = await student.update({
                ...body,
            });
    
            return res.status(200).json(updatedStudent);
        }catch(error){
            await deleteImage(req?.file?.path);
            throw error;
        }
    })
];

exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findByPk(id);

    if (!student) {
        // throw {message:'Student not found'}
        return res.status(404).json({ message: 'Student not found' });
    }

    await student.destroy();
    return res.status(200).json({ message: 'Student deleted successfully' });
});

exports.chnageGroup = asyncHandler(async (req, res) => {
    const { id: group_id } = req.params;
    const { student_id } = req.body;

    const student = await Student.findByPk(student_id);
    const group = await Group.findByPk(group_id);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    if (!group) {
        // throw { message: 'Group not found' };
        return res.status(404).json({ message: 'Group not found' });
    }
    const updatedStudent = await student.update({ group_id });
    return res.status(200).json(updatedStudent);
});

exports.analyzeStudentPerformance = asyncHandler( async(req, res) => {
    const { id:studentId } = req.params;
    try {
        
        // Step 1: Fetch attendance records for the student
        const attendanceRecords = await Attendance.findAll({
            where: { student_id: studentId, attended: true, isDeleted: false },
            include: {
                model: Lecture,
                attributes: ['name', 'lecture_number', 'group_id'],
                include:{
                    model: Group,
                    attributes: ['name','id']
                }
            },
        });
        if (attendanceRecords.length === 0) {
            return res.status(200).json({
                studentId, 
                message: 'No attendance records found.', 
                overallGrade: 0, 
                report: []
            });
        }

        // Step 2: Fetch grades for the attended lectures
        const lectureIds = attendanceRecords.map(record => record.lecture_id);
        const grades = await Lecture_Exam.findAll({
            where: { 
                student_id: studentId, 
                lecture_id: lectureIds, 
                isDeleted: false 
            },
            attributes: ['lecture_id', 'grade'],
        });

        // Map grades to their corresponding lectures
        const gradesMap = grades.reduce((map, gradeRecord) => {
            map[gradeRecord.lecture_id] = gradeRecord.grade;
            return map;
        }, {});

        // Step 3: Calculate overall grade
        const totalGrades = grades.reduce((sum, record) => sum + record.grade, 0);
        const overallGrade = (totalGrades / attendanceRecords.length).toFixed(2);
        const overallHomeworkGrade = (attendanceRecords.reduce((sum, record) => sum + parseInt(record.homework_type), 0) / grades.length).toFixed(2); 

        // Step 4: Generate the report
        const report = attendanceRecords.map(record => {
            const grade = gradesMap[record.lecture_id] || 0;
            return {
                id: record.lecture_id,
                name: record.Lecture.name,
                lecture_number: record.Lecture.lecture_number,
                group: record.Lecture.Group,
                attended: record.attended,
                isCompensatory: record.isCompensatory,
                homeworkType: record.homework_type,
                LectureGrade:grade,
            };
        });

        return res.status(200).json({ 
            studentId,
            overallGrade,
            overallHomeworkGrade,
            report,
        });
    } catch (error) {
        console.error('Error analyzing student performance:', error);
        throw new Error('Could not analyze student performance.');
    }
});
