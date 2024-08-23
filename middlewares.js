import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import hpp from "hpp";
import express from "express";
import { config } from "./config/config.js";

export const initializeMiddlewares = (app) => {
  // Set allowed origins for CORS based on the environment
  const allowedOrigins = config.NODE_ENV === "production"
    ? config.ALLOWED_ORIGINS.split(",")
    : "*";

  // CORS options configuration
  const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  };

  // Rate limiter configuration
  const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: "Too many requests from this IP, please try again in an hour!",
    keyGenerator: (req) => req.ip, // use IP address as the key
  });

  // Trust proxy settings (for Heroku, Nginx, etc.)
  app.set("trust proxy", 1);

  // Middleware stack
  app.use(cors(corsOptions));            // Enable CORS with the specified options
  app.use(helmet());                     // Set security-related HTTP headers
  app.use(express.json());               // Parse incoming JSON requests
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
  app.use(rateLimiter);                  // Apply rate limiting
  app.use(hpp());                        // Prevent HTTP Parameter Pollution
  app.use(mongoSanitize());              // Sanitize user-supplied data to prevent MongoDB operator injection
  app.use(compression());                // Compress response bodies for all requests
  app.use(express.static("public", { maxAge: "1d" })); // Serve static files with caching
};
