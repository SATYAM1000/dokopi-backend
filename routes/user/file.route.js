import {
  storeFileInformation,
  getFileDetailsForUserById,
  getFilesForUserWithPagination,
  fetchSharedFiles,
  shareFileWithUserByEmail,
  deleteFileById,
  uploadFileToS3,
} from "../../controllers/user/file.controller.js";
import upload from "../../middlewares/multer.middleware.js";
import { verifyUser } from "../../middlewares/user.middleware.js";
import { Router } from "express";

const userFilesRouter = Router();

// Endpoint to upload a file to S3
userFilesRouter.post(
  "/upload",
  verifyUser,
  upload.single("file"),
  uploadFileToS3
);

// Endpoint to store file information
userFilesRouter.post(
  "/store-file-info/:storeId",
  verifyUser,
  storeFileInformation
);

// Endpoint to get file details by user ID
userFilesRouter.get("/details/:userId", getFileDetailsForUserById);

// Endpoint to get files for a user with pagination
userFilesRouter.get("/user/:userId", getFilesForUserWithPagination);

// Endpoint to fetch shared files
userFilesRouter.get("/shared", fetchSharedFiles);

// Endpoint to share a file with a user by email
userFilesRouter.post("/share", shareFileWithUserByEmail);

// Endpoint to delete a file by ID
userFilesRouter.delete("/:fileId", deleteFileById);

export default userFilesRouter;
