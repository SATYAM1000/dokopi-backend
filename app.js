import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import compression from "compression";

import hpp from "hpp";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.config.js";
import { logger } from "./config/logger.config.js";
import { socketHandlers } from "./config/socket.config.js";
import asyncHandler from "express-async-handler";

const app = express();

const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [
      "https://www.dokopi.com",
      "https://merchant.dokopi.com",
      "https://api.dokopi.com",
      "https://api.phonepe.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests from this IP, please try again in an hour!",
});

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://www.dokopi.com",
      "https://merchant.dokopi.com",
      "https://api.dokopi.com",
      "https://api.phonepe.com",
      "http://localhost:3000",
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
