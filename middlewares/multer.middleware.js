import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { logger } from "../config/logger.config.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    try {
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      const allowedExtensions = [
        ".pdf",
        ".docx",
        ".jpg",
        ".png",
        ".pptx",
        ".jpeg"
      ];
      const fileExt = path.extname(file.originalname).toLowerCase(); // Convert extension to lowercase

      if (!allowedExtensions.includes(fileExt)) {
        logger.error(
          "Invalid file type. Only PDF, DOCX, JPG, JPEG, PNG, PPTX allowed."
        );

        req.fileValidationError =
          "Invalid file type. Only PDF, DOCX, JPG, JPEG, PNG, PPTX allowed.";
        return cb(new Error(req.fileValidationError), false);
      }
      cb(null, uniqueFilename);
    } catch (error) {
      logger.error(`Error while processing file upload: ${error.message}`);

      cb(error);
    }
  },
});

const upload = multer({ storage });

export default upload;
