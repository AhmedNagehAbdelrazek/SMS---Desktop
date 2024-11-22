const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/avatars");

    if(!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath,{ recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a random unique name
    const randomName = crypto.randomBytes(16).toString("hex"); // 32-character random string
    const fileExtension = path.extname(file.originalname); // Preserve the file extension
    const newFileName = `${randomName}${fileExtension}`;
    cb(null, newFileName);
  },
});

// Multer instance
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."));
    }
  },
});

module.exports = upload;
