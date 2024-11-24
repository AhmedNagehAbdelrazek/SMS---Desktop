const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Define a writable directory outside the snapshot
const uploadDir = path.join(process.cwd(), "uploads/avatars"); // `process.cwd()` is the current working directory

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a random unique name
    function CreateFileRandomName(){
      const randomName = crypto.randomBytes(16).toString("hex"); // 32-character random string
      const fileExtension = path.extname(file.originalname); // Preserve the file extension
      return `${randomName}${fileExtension}`;
    }
    let newFileName = CreateFileRandomName();

    while(true){
      if (!fs.existsSync(path.join(uploadDir,newFileName))) {
        break;
      }
      newFileName = CreateFileRandomName();
    }
    
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
