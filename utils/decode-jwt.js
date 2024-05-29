import { logger } from "../config/logger.config.js";
import { decode } from "next-auth/jwt";

export const decodeJWT = async (token) => {
  const SALT_KEY =
    process.env.NODE_ENV === "productiom=n"
      ? process.env.JWT_SALT
      : process.env.DEVELOPMENT_JWT_SALT;
  try {
    const decodedToken = await decode({
      token: token,
      salt: process.env.JWT_SALT,
      secret: process.env.JWT_SECRET,
    });

    return decodedToken;
  } catch (error) {
    logger.error(`Error while decoding JWT: ${error.message}`);
    return null;
  }
};
