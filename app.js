import express from "express";
import { config } from "./config/config.js";
import { initializeMiddlewares } from "./middlewares.js";
import { initializeRoutes } from "./route.js";
import { connectDB } from "./config/db.config.js";
import { createServer } from "./server.js";
import { logger } from "./config/logger.config.js";
import { globalErrorHandler } from "./config/globalErrorHandler.js";

const app = express();

// Initialize middlewares
initializeMiddlewares(app);

// Initialize routes
initializeRoutes(app);

// Handle 404 errors for undefined routes
app.use((req, res, next) => {
  logger.warn(`404 Error: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: "fail",
    message: "Resource not found. Please check the URL and try again.",
  });
});

// Global error handler (must be registered after routes)
app.use(globalErrorHandler);

// Connect to the database and start the server
connectDB(config.DATABASE_URL)
  .then(() => {
    const server = createServer(app);
    server.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
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
    logger.error(`MongoDB Connection Error: ${error.message}`, { error });
    process.exit(1);
  });
