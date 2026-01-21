const multer = require("multer");
const path = require("path");
const fs = require("fs"); // ✅ FIX

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
   filename: (req, file, cb) => {
    // ✅ original filename
    const originalName = file.originalname;

    const filePath = path.join(uploadDir, originalName);

    // 🔥 overwrite if file already exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, originalName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({storage})

module.exports = upload;
