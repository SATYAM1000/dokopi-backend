import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import {
  changeOrderStatus,
  getTotalOrderDetails,
  getXeroxStoreOrdersById,
  isOrderViewed,
} from "../../controllers/merchant/order.controller.js";
import { Router } from "express";

export const merchantOrderRouter = Router();

// Endpoint to check and get merchant active orders after its opening
merchantOrderRouter.get("/:storeId", verifyMerchant, getXeroxStoreOrdersById);
// Endpoint to check user order viewed status
merchantOrderRouter.put("/is-viewed/:orderId", verifyMerchant, isOrderViewed);

// Endpoint to change order status
merchantOrderRouter.put(
  "/change-status/:orderId/:status",
  verifyMerchant,
  changeOrderStatus
);

// Endpoint to get the data for dashboard routes(to get the total orders details till registerd)
merchantOrderRouter.get(
  "/dashboard/:storeId",
  verifyMerchant,
  getTotalOrderDetails
);

// Endpoint to change order status
merchantOrderRouter.put(
  "/change-status/:orderId/:status",
  verifyMerchant,
  changeOrderStatus
);
