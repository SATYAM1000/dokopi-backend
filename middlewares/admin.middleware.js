import { logger } from "../config/logger.config.js";
import { User } from "../models/user.model.js";
import { decodeJWT } from "../utils/decode-jwt.js";
const AUTH_ERROR_MESSAGE = "Please authenticate using a valid token!";

export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({
        msg: AUTH_ERROR_MESSAGE,
        success: false,
      });
    }
    const jwtToken = token.split(" ")[1];
    if (!jwtToken) {
      return res.status(401).json({
        msg: AUTH_ERROR_MESSAGE,
        success: false,
      });
    }
    const decoded = await decodeJWT(jwtToken);
    const user = await User.findById(decoded?.sub);
    if (!user) {
      return res.status(401).json({
        msg: "User not found",
        success: false,
      });
    }
    if (user.role !== "ADMIN") {
      return res.status(401).json({
        msg: "Unauthorized access",
        success: false,
      });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Error while verifying admin: ${error.message}`);
    return res.status(401).json({
      msg: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
