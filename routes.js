import { userRouter } from "./routes/user/user.route.js";
import userStoreRouter from "./routes/user/store.route.js";
import userFilesRouter from "./routes/user/file.route.js";
import merchantStoreRouter from "./routes/merchant/store.route.js";
import { merchantOrderRouter } from "./routes/merchant/order.route.js";
import { chartRouter } from "./routes/merchant/chart.route.js";
import paymentRouter from "./routes/user/payment.route.js";
import userOrderRouter from "./routes/user/order.route.js";
import invoiceRouter from "./routes/user/invoice.route.js";
import locationRouter from "./routes/location/locationfromname.js";
import { xeroxStorePriceRouter } from "./routes/merchant/price.route.js";
import { cartRouter } from "./routes/user/cart.route.js";
import asyncHandler from "express-async-handler";
import { logger } from "./config/logger.config.js";
import quicker from "./utils/quicker.js";

export const initializeRoutes = (app) => {
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/user/stores", userStoreRouter);
  app.use("/api/v1/user/files", userFilesRouter);
  app.use("/api/v1/merchant/store", merchantStoreRouter);
  app.use("/api/v1/merchant/orders", merchantOrderRouter);
  app.use("/api/v1/chart", chartRouter);
  app.use("/api/v1/user/payment", paymentRouter);
  app.use("/api/v1/user/orders", userOrderRouter);
  app.use("/api/v1/invoice", invoiceRouter);
  app.use("/api/v1", locationRouter);
  app.use("/api/v1/store/pricing", xeroxStorePriceRouter);
  app.use("/api/v1/user/cart", cartRouter);

  app.get(
    "/api/v1/test",
    asyncHandler(async (req, res) => {
      res.send("👋 Hello from the server side!");
    })
  );

  app.get("/api/v1/health", (req, res) => {
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
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  });
};
