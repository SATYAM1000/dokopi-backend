import express from "express";
import { verifyUser } from "../../middlewares/user.middleware.js";
import {
  checkPaymentStatus,
  checkout,
} from "../../controllers/user/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/phonepe", verifyUser, checkout);
paymentRouter.post("/status", checkPaymentStatus);

export default paymentRouter;
