import { logger } from "../config/logger.config.js";
import { User } from "../models/user.model.js";
import { decodeJWT } from "../utils/decode-jwt.js";
const AUTH_ERROR_MESSAGE = "Please authenticate using a valid token!";

export const verifyUser = async (req, res, next) => {
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
        msg: "Invalid login credentials. Please log in again.",
        success: false,
      });
    }
    if (
      user.role !== "USER" &&
      user.role !== "MERCHANT" &&
      user.role !== "ADMIN"
    ) {
      return res.status(401).json({
        msg: "Invalid bearer token",
        success: false,
      });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Error while verifying admin: ${error.message}`);
    return res.status(401).json({
      msg: "Invalid login credentials. Please log in again.",
      success: false,
      error: error.message,
    });
  }
};
