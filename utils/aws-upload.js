import fs from "fs";
import path from "path";
import { logger } from "../config/logger.config.js";
import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

async function generatePresignedURL(
  bucketName,
  objectKey,
  expirationTimeInSeconds = 604800
) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    const url = await getSignedUrl(S3client, command, {
      expiresIn: expirationTimeInSeconds,
    });
    return url;
  } catch (error) {
    logger.error(`Error while generating presigned URL: ${error.message}`);
    throw error;
  }
}

export const uploadToS3 = async (localFilePath) => {
  if (!localFilePath) {
    throw new Error("File path is required");
  }

  const fileStream = fs.createReadStream(localFilePath);

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Body: fileStream,
    Key: path.basename(localFilePath),
  };

  const command = new PutObjectCommand(uploadParams);

  try {
    const data = await S3client.send(command);
    fs.unlinkSync(localFilePath);
    const presignedURL = await generatePresignedURL(
      process.env.AWS_BUCKET_NAME,
      path.basename(localFilePath)
    );
    return presignedURL;
     
  } catch (error) {
    fs.unlinkSync(localFilePath);
    logger.error(`Error while uploading file: ${error.message}`);
    throw error;
  }
};
