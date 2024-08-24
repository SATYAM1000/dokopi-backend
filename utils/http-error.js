import { responseMessages } from "../constants/response-messages.js";
import { config } from "../config/config.js";
import { logger } from "../config/logger.config.js";

export const createErrorResponse = (error, req, statusCode = 500) => {
  const isDevelopment = config.NODE_ENV === "development";
  const isErrorInstance = error instanceof Error;

  const errorResponse = {
    success: false,
    statusCode: statusCode,
    request: {
      ip: isDevelopment ? req.ip : null,
      method: req.method || null,
      url: req.url || null,
    },
    message: isErrorInstance ? error.message : responseMessages.ERROR,
    data: null,
    stack:
      isDevelopment && isErrorInstance ? { error: error.stack } : undefined,
  };

  logger.error("HTTP_ERROR", {
    meta: { error: errorResponse },
  });

  return errorResponse;
};

export const handleHttpError = (next, err, req, statusCode = 500) => {
  const errorObj = createErrorResponse(err, req, statusCode);
  return next(errorObj);
};
