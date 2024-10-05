import { uploadFileToS3 } from "../../controllers/user/file.controller.js";
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

export default userFilesRouter;
