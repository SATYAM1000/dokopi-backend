import { logger } from "./logger.config.js";
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  // Log-Log the error
  logger.error(`Error: ${err.message}\nStack: ${err.stack}`);
  
  res.status(statusCode).json({
    status,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
