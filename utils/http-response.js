import { config } from "../config/config.js";
import { logger } from "../config/logger.config.js";

export const sendHttpResponse = (
  req,
  res,
  responseStatusCode = 200,
  responseMessage = "",
  responseData = null
) => {
  const response = {
    success: responseStatusCode >= 200 && responseStatusCode < 300,
    status: responseStatusCode,
    request: {
      ip: req.ip || null,
      method: req.method || null,
      url: req.url || null,
    },
    message: responseMessage,
    data: responseData,
  };

  if (config.NODE_ENV === "production") {
    delete response.request.ip;
  }

  try {
    logger.info(`HTTP response`, { meta: { response } });
    return res.status(responseStatusCode).json(response);
  } catch (error) {
    logger.error("Error sending HTTP response", { error });
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Internal Server Error",
    });
  }
};
