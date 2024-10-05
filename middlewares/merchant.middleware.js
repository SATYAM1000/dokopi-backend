import { logger } from "../config/logger.config.js";
import { User } from "../models/user.model.js";
import { decodeJWT } from "../utils/decode-jwt.js";
import { XeroxStore } from "../models/store.model.js";

const AUTH_ERROR_MESSAGE = "Please authenticate using a valid token!";

export const verifyMerchant = async (req, res, next) => {
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
    if (
      user.role !== "MERCHANT" &&
      user.role !== "ADMIN" &&
      user.role !== "USER"
    ) {
      return res.status(401).json({
        msg: "Unauthorized access",
        success: false,
      });
    }

    const storeInfo = await XeroxStore.findOne({ storeOwner: user._id });

    if (!storeInfo) {
      return res.status(401).json({
        msg: "Unauthorized access",
        success: false,
      });
    }

    req.storeInfo = storeInfo;
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
