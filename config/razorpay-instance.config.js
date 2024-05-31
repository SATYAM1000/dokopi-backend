import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const instance =
  process.env.NODE_ENV === "production"
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : new Razorpay({
        key_id: process.env.TEST_RAZORPAY_KEY_ID,
        key_secret: process.env.TEST_RAZORPAY_KEY_SECRET,
      });
