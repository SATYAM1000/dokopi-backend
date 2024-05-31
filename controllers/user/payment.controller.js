import { instance } from "../../config/razorpay-instance.config.js";
import crypto from "crypto";
import { logger } from "../../config/logger.config.js";
import { decryptCartItems } from "../../utils/decrypt-cart-items.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";
import { generateReceipt } from "../../utils/generate-receipt.js";

export const checkout = async (req, res) => {
  const { amount, cartItems } = req.body;
  const { userId, storeId } = req.query;

  if (!amount || amount < 1 || !cartItems || cartItems.length < 1) {
    return res.status(400).json({
      success: false,
      msg: "Amount and cartItems are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid User ID",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    return res.status(400).json({
      success: false,
      msg: "Invalid Store ID",
    });
  }
  try {
    const receipt = generateReceipt(userId);
    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: receipt,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
    if (!order) {
      throw new Error("Error while creating order");
    }

    const decryptedCartItems = decryptCartItems(cartItems);

    const newOrder = new Order({
      userId,
      storeId,
      cartItems: decryptedCartItems,
      totalPrice: amount,
      orderStatus: "pending",
      paymentStatus: "pending",
      razorpayOrderId: order.id,
    });

    await newOrder.save();

    res.status(200).json({
      success: true,
      order: order,
      currentOrderId: newOrder._id,
    });
  } catch (error) {
    logger.error("Error while creating order: ", error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        msg:
          "razorpay_order_id, razorpay_payment_id, razorpay_signature are required",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const razorpay_secret =
      process.env.NODE_ENV === "production"
        ? process.env.RAZORPAY_KEY_SECRET
        : process.env.TEST_RAZORPAY_KEY_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", razorpay_secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "paid",
          orderStatus: "processing",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
        { new: true }
      );

      if (!order) {
        throw new Error("Order not found");
      }

      logger.info(`Payment successful for order ${razorpay_order_id}`);

      res.redirect(
        `${process.env.PAYMENT_SUCCESS_URL}?reference=${razorpay_payment_id}`
      );
    } else {
      logger.warn(`Invalid payment signature for order ${razorpay_order_id}`);
      res.redirect(
        `${process.env.PAYMENT_FAILURE_URL}?reference=${razorpay_payment_id}`
      );
    }
  } catch (error) {
    logger.error(`Error during payment verification: ${error.message}`);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const getRazorpayKey = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } else {
      res.status(200).json({
        success: true,
        key: process.env.TEST_RAZORPAY_KEY_ID,
      });
    }
  } catch (error) {
    logger.error("Error while getting Razorpay key: ", error.message);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const verifyPaymentRefrenceId = async (req, res) => {
  try {
    const { paymentRefrenceId } = req.query;
    if (!paymentRefrenceId) {
      return res.status(400).json({
        success: false,
        msg: "paymentRefrenceId is required",
      });
    }

    const order = await Order.findOne({
      razorpayPaymentId: paymentRefrenceId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found",
      });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized access",
      });
    }

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    logger.error(`Error while verifying payment refrence id: ${error.message}`);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
