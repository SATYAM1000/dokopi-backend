import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import {
  getXeroxStoreOrdersById,
  isOrderViewed,
} from "../../controllers/merchant/order.controller.js";
import { Router } from "express";

export const merchantOrderRouter = Router();

// Endpoint to check and get merchant active orders after its opening
merchantOrderRouter.get(
  "/:storeId",
  getXeroxStoreOrdersById
);
// Endpoint to check user order viewed status
merchantOrderRouter.put("/is-viewed/:orderId", verifyMerchant, isOrderViewed);
