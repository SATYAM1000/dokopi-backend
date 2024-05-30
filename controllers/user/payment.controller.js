import { instance } from "../../config/razorpay-instance.config.js";
import crypto from "crypto";
import { logger } from "../../config/logger.config.js";
export const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100), // amount in the smallest currency unit
    currency: "INR",
    receipt: "receipt#1",
    payment_capture: 1,
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("signature is ", expectedSignature);
    console.log("razorpay signature is ", razorpay_signature);

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Database comes here
      res.redirect(
        `http://localhost:3000/payment/success?reference=${razorpay_payment_id}`
      );
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error("Error while getting Razorpay key: ", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
