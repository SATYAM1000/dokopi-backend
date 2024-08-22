import { config } from "./config/config.js";
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

// 404 Error Handler
app.use((req, res, next) => {
  logger.warn(`404 Error: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: "fail",
    message: "Resource not found. Please check the URL and try again.",
  });
});

//Global error handler - must be after all routes
app.use(globalErrorHandler);
connectDB(config.DATABASE_URL)
  .then(() => {
    const server = createServer(app);
    server.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB Error: ${error.message}`, { error });
    process.exit(1);
  });

// Graceful shutdown
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
