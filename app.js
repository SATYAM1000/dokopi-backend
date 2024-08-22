import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { initializeMiddlewares } from "./middlewares.js";
import { initializeRoutes } from "./routes.js";
import { connectDB } from "./config/db.config.js";
import { createServer } from "./server.js";
import { logger } from "./config/logger.config.js";
import { globalErrorHandler } from "./config/globalErrorHandler.js";

const app = express();

initializeMiddlewares(app);
initializeRoutes(app);

//Global error handler - should be after all routes
app.use(globalErrorHandler);

connectDB(process.env.DATABASE_URL)
  .then(() => {
    const server = createServer(app);
    server.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  });

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});
