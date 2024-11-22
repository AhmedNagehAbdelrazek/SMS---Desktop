const asyncHandler = require("express-async-handler");
const { Student, Group } = require("../models/index");
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
                    throw { message: "Group not found" };
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
    const students = await Student.findAll();
    return res.status(200).json(students);
});

exports.getStudentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
        throw { message: 'Student not found' };
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
            const avatar = req.file;
            if (avatar && student.avatar) {
                // delete the old avatar
                let avatarPath = student.avatar.split('/');
                avatarPath = avatarPath[avatarPath.length - 1];
                avatarPath = require('path').join(__dirname, "..", 'uploads', 'avatars', avatarPath);
                await deleteImage(avatarPath);
            }
    
            // const baseUrl = `${req.protocol}://${req.get("host")}`; // Get the base URL dynamically
            const avatarPath = req.file ? `/uploads/avatars/${req.file.filename}` : null;
    
            body.avatar = avatarPath;
    
            const updatedStudent = await student.update({
                ...body,
                avatar: avatarPath,
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
        throw {message:'Student not found'}
        // return res.status(404).json({ message: 'Student not found' });
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
        throw { message: 'Student not found' };
    }
    if (!group) {
        throw { message: 'Group not found' };
    }
    const updatedStudent = await student.update({ group_id });
    return res.status(200).json(updatedStudent);
});

exports.searchStudents = asyncHandler(async (req, res) => {
    const { search } = req.body;
    console.log("search", search);
    
    console.log(typeof search);
    if (!search) {
        throw { message: "Search term is required." };
    }

    const students = await Student.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { phone_number: { [Op.like]: `%${search}%` } }, // Correct column name
                { id: { [Op.like]: `%${search}%` } },
            ],
        },
    });

    if (students.length === 0) {
        // return res.status(404).json({ message: "No students found." });
        throw {message:"No students found."};
    }

    return res.status(200).json(students);
});
