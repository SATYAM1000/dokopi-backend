import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit"; // Middleware to limit request rate , prevent DDOS
import helmet from "helmet"; // Security middleware to set HTTP headers
import ExpressMongoSanitize from "express-mongo-sanitize"; // Middleware to prevent NoSQL injection attacks
import compression from "compression"; // Middleware to compress responses
import hpp from "hpp"; // Middleware to protect against HTTP parameter pollution

import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.config.js";
import { logger } from "./config/logger.config.js";
import { socketHandlers } from "./config/socket.config.js";
import asyncHandler from "express-async-handler";

const app = express();

// Trust the first proxy in the chain (if behind a proxy)
//  This line is used in Express applications that are deployed behind a reverse proxy (like Nginx).
//  It allows us to trust the proxy's IP address and avoid man-in-the-middle attacks.
// When your Express app is deployed behind a reverse proxy, the client’s IP address isn’t directly visible to the Express app. Instead, the proxy forwards the request to your app, often including the original IP address of the client in the X-Forwarded-For header.
// Client → Proxy (e.g., Nginx) → Express App.

//By default, Express does not trust the X-Forwarded-For header because it could be spoofed. However, if you know that your app is behind a trusted proxy, you can instruct Express to trust this header. This way, Express can correctly determine the client’s original IP address
app.set("trust proxy", 1);

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      "https://www.dokopi.com",
      "https://merchant.dokopi.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, 
  message: "Too many requests from this IP, please try again in an hour!",
  keyGenerator: (req) => {
    return req.ip; // IP address of the client
  },
});

const allowedOrigins = [
  "https://www.dokopi.com",
  "https://merchant.dokopi.com",
  "https://api.dokopi.com",
  "http://localhost:3000",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet()); // Set various HTTP headers for security
app.use(express.json()); // Enable JSON parsing
app.use(express.urlencoded({ extended: true })); // Enable URL-encoded parsing
app.use(globalLimiter);
app.use(hpp());
app.use(ExpressMongoSanitize());
app.use(compression());
app.use(
  express.static("public", {
    maxAge: "1d", // Cache static assets for one day
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

connectDB(process.env.DATABASE_URL)
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  });

import { userRouter } from "./routes/user/user.route.js";
app.use("/api/v1/user", userRouter);

import userStoreRouter from "./routes/user/store.route.js";
app.use("/api/v1/user/stores", userStoreRouter);

import userFilesRouter from "./routes/user/file.route.js";
app.use("/api/v1/user/files", userFilesRouter);

import merchantStoreRouter from "./routes/merchant/store.route.js";
app.use("/api/v1/merchant/store", merchantStoreRouter);

import { merchantOrderRouter } from "./routes/merchant/order.route.js";
app.use("/api/v1/merchant/orders", merchantOrderRouter);

import { chartRouter } from "./routes/merchant/chart.route.js";
app.use("/api/v1/chart", chartRouter);

import paymentRouter from "./routes/user/payment.route.js";
app.use("/api/v1/user/payment", paymentRouter);

import userOrderRouter from "./routes/user/order.route.js";
app.use("/api/v1/user/orders", userOrderRouter);

import invoiceRouter from "./routes/user/invoice.route.js";
app.use("/api/v1/invoice", invoiceRouter);

import locationRouter from "./routes/location/locationfromname.js";
app.use("/api/v1", locationRouter);

import { xeroxStorePriceRouter } from "./routes/merchant/price.route.js";
app.use("/api/v1/store/pricing", xeroxStorePriceRouter);

import { cartRouter } from "./routes/user/cart.route.js";
app.use("/api/v1/user/cart", cartRouter);

app.get(
  "/api/test",
  asyncHandler(async (req, res) => {
    res.send("Hello from the server side!");
  })
);

socketHandlers(io, logger);

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
  });
});
