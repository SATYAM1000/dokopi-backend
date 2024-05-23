import { logger } from "../../config/logger.config.js";
import { File } from "../../models/file.model.js";
import { uploadToS3 } from "../../utils/aws-upload.js";
import { pageCounter } from "../../utils/page-count.js";
import { calculatePrintingPrice } from "../../utils/price-calculator.js";
import { XeroxStore } from "../../models/store.model.js";
import { validateFields } from "../../utils/validate-fields.js";
import fs from "fs";
import mongoose from "mongoose";

//POST /api/v1/user/upload
export const uploadFileToS3 = async (req, res) => {
  try {
    if (req.fileValidationError) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        msg: req.fileValidationError,
        success: false,
      });
    }

    if (!req.file)
      return res.status(400).json({
        msg: "File not found!",
        success: false,
      });

    const extension = req.file.originalname.split(".").pop();
    const pageCount = await pageCounter(req.file.path, extension);
    if (!pageCount) {
      return res.status(500).json({
        msg: "Internal server error!",
        success: false,
      });
    }
    const uploadedFile = await uploadToS3(req.file.path);
    if (!uploadedFile) {
      fs.unlinkSync(req.file.path);
      return res.status(500).json({
        msg: "Internal server error!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "File uploaded successfully!",
      success: true,
      url: uploadedFile,
      pageCount,
    });
  } catch (error) {
    fs.unlinkSync(req.file.path);
    logger.error(`Error while uploading file to S3: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

//POST /api/v1/user/store-file-info/:storeId
export const storeFileInformation = async (req, res) => {
  try {
    const storeId = req.params.storeId;

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const store = await XeroxStore.findById(storeId);
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    const userId = req.user?._id;

    const requiredFields = [
      "fileURL",
      "fileOriginalName",
      "fileSize",
      "filePageCount",
    ];
    const isValid = validateFields(req.body, requiredFields);

    if (!isValid) {
      return res.status(400).json({
        msg: "All fields are required!",
        success: false,
      });
    }

    const {
      fileURL,
      fileOriginalName,
      fileSize,
      filePageCount,
      fileColorType = "black and white",
      filePrintMode = "simplex",
      filePaperType = "A4",
      fileCopiesCount = 1,
      messageForXeroxStore=null,
      additionalServices = [],
    } = req.body;

    const fileExtension = fileOriginalName.split(".").pop();
    const allowedExtensions = ["pdf", "docx", "jpg", "png", "jpeg", "pptx"];
    console.log(fileExtension);
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        msg: "Invalid file type!",
        success: false,
      });
    }

    console.log(fileURL);

    const fileIconPath = `/file-icons/${fileExtension}.svg`;

    const file = new File({
      basicFileInfo: {
        fileURL,
        fileOriginalName,
        fileExtension,
        fileSize,
        filePageCount,
        fileOwner: userId,
        fileIconPath,
      },
      printSettings: {
        fileColorType,
        filePrintMode,
        filePaperType,
        fileCopiesCount,
        messageForXeroxStore,
        additionalServices,
      },
      fileStatus: "uploaded",
    });

    await file.save();

    console.log("file saved...")

    const filePrice = await calculatePrintingPrice(file?._id, storeId);
    console.log(filePrice);
    file.basicFileInfo.filePrice = filePrice;
    await file.save();

    return res.status(200).json({
      msg: "File information stored successfully!",
      success: true,
      file,
    });
  } catch (error) {
    logger.error(`Error while storing file information: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};


export const getFileDetailsForUserById = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }
    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        msg: "Invalid file id!",
        success: false,
      });
    }

    const file = await File.findOne({ _id: fileId, fileOwner: userId });

    if (!file) {
      return res.status(404).json({
        msg: "File not found for the user!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "File details retrieved successfully!",
      success: true,
      file,
    });
  } catch (error) {
    logger.error(`Error while retrieving file details by id: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

// GET /api/files?page=1&limit=10

export const getFilesForUserWithPagination = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        msg: "Invalid user id!",
        success: false,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        msg: "Invalid pagination parameters!",
        success: false,
      });
    }
    const MAX_LIMIT = 20;
    if (limit > MAX_LIMIT) {
      return res.status(400).json({
        msg: `Limit parameter exceeds maximum allowed value (${MAX_LIMIT})!`,
        success: false,
      });
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const files = await File.find({ fileOwner: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex)
      .exec();

    const pagination = {};
    if (endIndex < files.length) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    return res.status(200).json({
      msg: "Files retrieved successfully!",
      success: true,
      files,
      pagination,
      totalPages: Math.ceil(files.length / limit),
    });
  } catch (error) {
    logger.error(`Error while retrieving files for user: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const shareFileWithUserByEmail = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const email = req.body.email;

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        msg: "Invalid file id!",
        success: false,
      });
    }

    if (!email) {
      return res.status(400).json({
        msg: "Email is required!",
        success: false,
      });
    }

    const file = await File.findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({
        msg: "File not found!",
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }

    if (file.fileOwner.toString() === user._id.toString()) {
      return res.status(400).json({
        msg: "You cannot share your own file!",
        success: false,
      });
    }

    if (file.sharedWith.includes(user._id)) {
      return res.status(400).json({
        msg: "File already shared with this user!",
        success: false,
      });
    }

    file.sharedWith.push(user._id);
    await file.save();

    return res.status(200).json({
      msg: "File shared successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(
      `Error while sharing file with user by email: ${error.message}`
    );
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

/**
 * Note: This API is not complete and requires additional implementation.
 */
export const fetchSharedFiles = async (req, res) => {
  try {
    //TODO: complete the whole code
  } catch (error) {
    logger.error(`Error while fetching shared files: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteFileById = async (req, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.user.id;
    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        msg: "Invalid file id!",
        success: false,
      });
    }

    const file = await File.findOne({ _id: fileId, fileOwner: userId });
    if (!file) {
      return res.status(404).json({
        msg: "File not found!",
        success: false,
      });
    }

    await file.remove();

    return res.status(200).json({
      msg: "File deleted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while deleting file: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
