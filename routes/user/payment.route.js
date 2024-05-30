import express from "express";
import {
  checkout,
  getRazorpayKey,
  paymentVerification,
} from "../../controllers/user/payment.controller.js";
import { verifyUser } from "../../middlewares/user.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/user-checkout", verifyUser, checkout);
paymentRouter.post("/verify", paymentVerification);
paymentRouter.get("/razorpay-key", verifyUser, getRazorpayKey);
export default paymentRouter;
