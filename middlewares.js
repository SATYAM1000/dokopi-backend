import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import ExpressMongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import hpp from "hpp";
import express from "express";

export const initializeMiddlewares = (app) => {
  const allowedOrigins = [
    "https://www.dokopi.com",
    "https://merchant.dokopi.com",
    "https://api.dokopi.com",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: "Too many requests from this IP, please try again in an hour!",
    keyGenerator: (req) => req.ip,
  });

  app.set("trust proxy", 1);
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(globalLimiter);
  app.use(hpp());
  app.use(ExpressMongoSanitize());
  app.use(compression());
  app.use(express.static("public", { maxAge: "1d" }));

};
