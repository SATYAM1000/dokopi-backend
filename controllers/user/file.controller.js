import { logger } from "../../config/logger.config.js";
import { uploadToS3 } from "../../utils/aws-upload.js";
import { pageCounter } from "../../utils/page-count.js";
import fs from "fs";

//POST /api/v1/user/upload
export const uploadFileToS3 = async (req, res) => {
  const filePath = req.file?.path;
  try {
    if (req.fileValidationError) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("file validation error");
      return res.status(400).json({
        msg: req.fileValidationError,
        success: false,
      });
    }

    if (!req.file) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("File not found!");
      return res.status(400).json({
        msg: "File not found!",
        success: false,
      });
    }
    const extension = req.file.originalname.split(".").pop().toLowerCase();

    const pageCount = await pageCounter(filePath, extension);
    if (!pageCount) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("page count error");
      return res.status(500).json({
        msg: "Error while getting page count!",
        success: false,
      });
    }
    const uploadedFile = await uploadToS3(req.file.path);
    if (!uploadedFile) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("upload to s3 error");
      return res.status(500).json({
        msg: "Internal server error !",
        success: false,
      });
    }

    if (fs.existsSync(filePath)) {
      fs.unlink(filePath);
    }
    return res.status(200).json({
      msg: "File uploaded successfully!",
      success: true,
      key: uploadedFile,
      pageCount,
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          logger.error(`Error while deleting file: ${err.message}`);
        }
      });
    }
    logger.error(`Error while uploading file to S3: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
