import { verifyUser } from "../../middlewares/user.middleware.js";
import {
  checkUserActiveOrders,
  fetchUserOrdersHistory,
  getOrderDetailsById,
} from "../../controllers/user/order.controller.js";
import { Router } from "express";

const userOrderRouter = Router();

// Endpoint to check and get user active orders
userOrderRouter.get("/active", verifyUser, checkUserActiveOrders);

// Endpoint to fetch user past orders
userOrderRouter.get("/history", verifyUser, fetchUserOrdersHistory);

//  Endpoint to fetch order details by its id
userOrderRouter.get("/:orderId", verifyUser, getOrderDetailsById);

export default userOrderRouter;
