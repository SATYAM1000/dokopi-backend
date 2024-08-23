import asyncHandler from "express-async-handler";
import { logger } from "./config/logger.config.js";
import quicker from "./utils/quicker.js";

// User-related routes
import { userRouter } from "./routes/user/user.route.js";
import userStoreRouter from "./routes/user/store.route.js";
import userFilesRouter from "./routes/user/file.route.js";
import userOrderRouter from "./routes/user/order.route.js";
import paymentRouter from "./routes/user/payment.route.js";
import invoiceRouter from "./routes/user/invoice.route.js";
import { cartRouter } from "./routes/user/cart.route.js";

// Merchant-related routes
import merchantStoreRouter from "./routes/merchant/store.route.js";
import { merchantOrderRouter } from "./routes/merchant/order.route.js";
import { xeroxStorePriceRouter } from "./routes/merchant/price.route.js";
import { chartRouter } from "./routes/merchant/chart.route.js";

// Location-related routes
import locationRouter from "./routes/location/locationfromname.js";

// Function to initialize routes
export const initializeRoutes = (app) => {
  const apiBasePath = "/api/v1";

  // User routes
  app.use(`${apiBasePath}/user`, userRouter);
  app.use(`${apiBasePath}/user/stores`, userStoreRouter);
  app.use(`${apiBasePath}/user/files`, userFilesRouter);
  app.use(`${apiBasePath}/user/orders`, userOrderRouter);
  app.use(`${apiBasePath}/user/payment`, paymentRouter);
  app.use(`${apiBasePath}/user/cart`, cartRouter);

  // Merchant routes
  app.use(`${apiBasePath}/merchant/store`, merchantStoreRouter);
  app.use(`${apiBasePath}/merchant/orders`, merchantOrderRouter);
  app.use(`${apiBasePath}/store/pricing`, xeroxStorePriceRouter);
  app.use(`${apiBasePath}/chart`, chartRouter);

  // Other routes
  app.use(`${apiBasePath}/invoice`, invoiceRouter);
  app.use(apiBasePath, locationRouter);
  
  // Test route
  app.get(`${apiBasePath}/test`, asyncHandler(async (req, res) => {
    res.send("👋 Hello from the server side!");
  }));

  // Health check route
  app.get(`${apiBasePath}/health`, (req, res) => {
    try {
      const healthData = {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        database: quicker.getDatabaseHealth(),
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(healthData);
    } catch (error) {
      logger.error("Health check failed:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
};
