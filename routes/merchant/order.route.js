import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import { getXeroxStoreOrdersById } from "../../controllers/merchant/order.controller.js";
import { Router } from "express";

export const merchantOrderRouter = Router();

// Endpoint to check and get merchant active orders after its opening
merchantOrderRouter.get(
  "/active/:storeId",
  verifyMerchant,
  getXeroxStoreOrdersById
);
