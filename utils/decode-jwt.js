import { logger } from "../config/logger.config.js";
import { decode } from "next-auth/jwt";

export const decodeJWT = async (token) => {
  const SALT_KEY =
    process.env.NODE_ENV === "production"
      ? process.env.JWT_SALT
      : process.env.JWT_SALT_DEV;

  try {
    if(process.env.NODE_ENV === "production"){
      return await decode({ token: token, salt: process.env.JWT_SALT, secret: process.env.JWT_SECRET });
    }

    const decodedToken = await decode({ token: token, salt: process.env.JWT_SALT_DEV, secret: process.env.JWT_SECRET });
    // const decodedToken = await decode({
    //   token: token,
    //   salt: SALT_KEY,
    //   secret: process.env.JWT_SECRET,
    // });

    return decodedToken;
  } catch (error) {
    logger.error(`Error while decoding JWT: ${error.message}`);
    return null;
  }
};
