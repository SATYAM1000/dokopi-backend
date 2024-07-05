import fs from "fs";
import path from "path";
import { logger } from "../config/logger.config.js";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const S3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    maxRetries: 5,
  },
});

export const uploadXeroxStoreImagesToS3 = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("File path is required");
  }

  const fileStream = fs.createReadStream(localFilePath);
  const folderName = "xeroxstores";
  const objectKey=`${folderName}/${path.basename(localFilePath)}`

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: fileStream,
    Key: objectKey,
  };

  const uploadOptions = {
    partSize: 100 * 1024 * 1024, 
    queueSize: 4,
  };

  try {
    const parallelUpload = new Upload({
      client: S3client,
      params: uploadParams,
      leavePartsOnError: false,
      ...uploadOptions,
    });

    const data = await parallelUpload.done();
    fs.unlinkSync(localFilePath);
    return objectKey;
  } catch (error) {
    logger.error(`Error while uploading store images: ${error.message}`);
    fs.unlinkSync(localFilePath);
    throw error;
  }
};
