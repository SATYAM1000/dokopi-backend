import express from "express";
import { checkout, paymentVerification } from "../../controllers/user/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/user-checkout",checkout);
paymentRouter.post("/verify",paymentVerification);

export default paymentRouter;