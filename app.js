import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.config.js";
import { logger } from "./config/logger.config.js";
import { socketHandlers } from "./config/socket.config.js";

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", limiter);
app.use(helmet());
app.use(hpp());
app.use(ExpressMongoSanitize());

connectDB(process.env.DATABASE_URL)
  .then(() => {
    server.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  });

app.get("/api/test", (req, res) => {
  res.send("Hello, World!");
});

import userStoreRouter from "./routes/user/store.route.js";
app.use("/api/v1/user/stores", userStoreRouter);

import userFilesRouter from "./routes/user/file.route.js";
app.use("/api/v1/user/files", userFilesRouter);

import merchantStoreRouter from "./routes/merchant/store.route.js";
app.use("/api/v1/merchant/store", merchantStoreRouter);

import paymentRouter from "./routes/user/payment.route.js";
app.use("/api/v1/user/payment", paymentRouter);

socketHandlers(io, logger);
