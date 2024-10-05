import express from "express";
import { verifyUser } from "../../middlewares/user.middleware.js";
import {
  checkPaymentStatus,
  checkout,
  paymentVerification,
} from "../../controllers/user/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/phonepe", verifyUser, checkout);
paymentRouter.post("/status", checkPaymentStatus);
paymentRouter.get("/verify-payment-id", verifyUser, paymentVerification);

export default paymentRouter;
