import express from "express";
import { config } from "./config/config.js";
import { initializeMiddlewares } from "./middlewares.js";
import { initializeRoutes } from "./route.js";
import { connectDB } from "./config/db.config.js";
import { createServer } from "./server.js";
import { logger } from "./config/logger.config.js";

const app = express();

// Initialize middlewares
initializeMiddlewares(app);

// Initialize routes
initializeRoutes(app);

// 404 Error handling (should be before global error handler) - called when requested route is not found
app.use((req, res, next) => {
  logger.warn(`404 Error: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Resource not found. Please check the URL and try again.",
    data: null,
  });
});

// Global error handler (final fallback for unhandled errors) - it catches all errors that are not handled by the centralized error handler
import { globalErrorHandler } from "./middlewares/error.middleware.js";
app.use(globalErrorHandler);

// Connect to the database and start the server
connectDB(config.DATABASE_URL)
  .then(() => {
    const server = createServer(app);
    server.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`, {
        meta: {
          ENVIRONMENT: config.NODE_ENV,
          PORT: config.PORT,
          SERVER_URL: config.SERVER_URL,
        },
      });
    });

    // Graceful shutdown handling
    const shutdownHandler = (signal) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
    process.on("SIGINT", () => shutdownHandler("SIGINT"));
  })
  .catch((error) => {
    logger.error(`Database Connection Error: ${error.message}`, { error });
    process.exit(1);
  });
