import mongoose from "mongoose";
import { logger } from "./logger.config.js";

export const connectDB = async (DATABASE_URL) => {
  try {
    const connectionInstance = await mongoose.connect(DATABASE_URL);
    logger.info(`MongoDB Connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

