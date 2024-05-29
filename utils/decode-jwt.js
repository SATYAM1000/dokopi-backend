import { logger } from "../config/logger.config.js";
import { decode } from "next-auth/jwt";

export const decodeJWT = async (token) => {
  console.log("token is ", token);
  console.log("env is ", process.env.NODE_ENV);
  const SALT_KEY = process.env.NODE_ENV === 'production' ? "__Secure-authjs.session-token" : "authjs.session-token";
  console.log("SALT_KEY is ", SALT_KEY);


  try {
    const decodedToken = await decode({
      token: token,
      salt: SALT_KEY,
      secret: process.env.JWT_SECRET,
    });

    return decodedToken;
  } catch (error) {
    logger.error(`Error while decoding JWT: ${error.message}`);
    return null;
  }
};
