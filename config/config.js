import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

export const config = {
  // general
  PORT: process.env.PORT,
  ENV: process.env.ENV,
  NODE_ENV: process.env.NODE_ENV,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  SERVER_URL: process.env.SERVER_URL,
  // database
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};
