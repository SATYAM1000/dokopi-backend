import mongoose from "mongoose";
import { logger } from "./logger.config.js";
import { config } from "./config.js";

export const connectDB = async (DATABASE_URL) => {
  if (!DATABASE_URL) {
    logger.error(
      "Database URL is missing. Please provide a valid DATABASE_URL."
    );
    process.exit(1);
  }

  try {
    const connectionInstance = await mongoose.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB: ", connectionInstance.connection.host);
    logger.info(`MongoDB Connected: ${connectionInstance.connection.host}`, {
      meta: {
        ENVIRONMENT: config.NODE_ENV,
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL,
      },
    });
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
