import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { logger } from "../config/logger.config.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".jpg",
      ".png",
      ".pptx",
      ".jpeg",
    ];
    if (
      !allowedExtensions.includes(path.extname(file.originalname).toLowerCase())
    ) {
      logger.error(
        "Invalid file type. Only PDF, DOCX, JPG, JPEG, PNG, PPTX allowed."
      );
     
      req.fileValidationError = "Invalid file type. Only PDF, DOCX, JPG, JPEG, PNG, PPTX allowed.";
      return cb(null,req.fileValidationError);
    }
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

export default upload;
