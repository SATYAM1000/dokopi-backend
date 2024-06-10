import crypto from "crypto";
import { logger } from "../../config/logger.config.js";
import { decryptCartItems } from "../../utils/decrypt-cart-items.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";
import { getNextSequenceValue } from "../../utils/next-seq-generator.js";
import axios from "axios";
import { io } from "../../app.js";
import { XeroxStore } from "../../models/store.model.js";
import { User } from "../../models/user.model.js";

const merchantId =
  process.env.NODE_ENV === "production"
    ? process.env.PHONE_PE_LIVE_MERCHANT_ID
    : process.env.PHONE_PE_TEST_MERCHANT_ID;
const saltKey =
  process.env.NODE_ENV === "production"
    ? process.env.PHONE_PE_LIVE_SALT_KEY
    : process.env.PHONE_PE_TEST_SALT_KEY;
const keyIndex =
  process.env.NODE_ENV === "production"
    ? process.env.PHONE_PE_LIVE_SALT_INDEX
    : process.env.PHONE_PE_TEST_SALT_INDEX;
const domain =
  process.env.NODE_ENV === "production"
    ? "https://api.dokopi.com"
    : "http://localhost:4000";

export const checkout = async (req, res) => {
  const { name, amount, cartItems, merchantTransactionId, merchantUserId } =
    req.body;
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
    const userInfo = await User.findOne({
      _id: userId,
    });

    if (!userInfo) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    const storeInfo = await XeroxStore.findById(storeId);
    if (!storeInfo) {
      return res.status(400).json({
        success: false,
        msg: "Store not found",
      });
    }

    if (storeInfo.storeCurrentStatus !== "open") {
      return res.status(400).json({
        success: false,
        msg: "Store is not open",
      });
    }

    const decryptedCartItems = decryptCartItems(cartItems);

    if (!decryptedCartItems) {
      throw new Error("Error while decrypting cart items");
    }

    const orderNumber = await getNextSequenceValue("orderID");

    const formattedOrderNumber = `#order_${orderNumber
      .toString()
      .padStart(6, "0")}`;

    const newOrder = new Order({
      userId,
      storeId,
      cartItems: decryptedCartItems,
      totalPrice: amount,
      orderStatus: "pending",
      paymentStatus: "pending",
      phonePeTransactionId: merchantTransactionId,
      phonePeMerchantUserId: merchantUserId,
      orderNumber: formattedOrderNumber,
    });

    await newOrder.save();

    const data = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: merchantUserId,
      name: name,
      amount: Number(amount) * 100,
      redirectUrl: `${domain}/api/v1/user/payment/status?id=${merchantTransactionId}`,
      redirectMode: "POST",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + saltKey;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const prod_URL =
      process.env.NODE_ENV === "production"
        ? process.env.PHONE_PE_PROD_URL
        : process.env.PHONE_PE_TEST_URL;

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        return res.status(200).json({
          success: true,
          data: response.data,
          msg: "Order created successfully",
        });
      })
      .catch(function (error) {
        logger.error("Error while creating order: ", error);
        res.status(500).json({
          success: false,
          msg: error.message,
        });
      });
  } catch (error) {
    logger.error("Error while creating order: ", error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { id } = req.query;
    const merchantTransactionId = id;
    if (!merchantTransactionId) {
      return res.status(400).json({
        success: false,
        msg: "merchantTransactionId is required",
      });
    }

    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const URL =
      process.env.NODE_ENV === "production"
        ? "https://api.phonepe.com/apis/hermes/pg/v1"
        : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1";

    const options = {
      method: "GET",
      url: `${URL}/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };

    axios
      .request(options)
      .then(async (response) => {
        if (response.data.success === true) {
          const order = await Order.findOneAndUpdate(
            { phonePeTransactionId: merchantTransactionId },
            { paymentStatus: "success" },
            { new: true }
          );

          io.emit("paymentSuccess", { storeId: order.storeId });
          const url =
            process.env.NODE_ENV === "production"
              ? `https://dokopi.com/payment/success?id=${merchantTransactionId}`
              : `http://localhost:3000/payment/success?id=${merchantTransactionId}`;
          return res.redirect(url);
        } else {
          const order = await Order.findOneAndUpdate(
            { phonePeTransactionId: merchantTransactionId },
            { paymentStatus: "failed" },
            { new: true }
          );
          const url =
            process.env.NODE_ENV === "production"
              ? `https://dokopi.com/payment/success?id=${merchantTransactionId}`
              : `http://localhost:3000/payment/success?id=${merchantTransactionId}`;
          return res.redirect(url);
        }
      })
      .catch((error) => {
        logger.error("Error while checking phonepe payment status: ", error);
        res.status(500).json({
          success: false,
          msg: error.message,
        });
      });
  } catch (error) {
    logger.error("Error while checking phonepe payment status: ", error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { paymentRefrenceId, userId } = req.query;
    if (!paymentRefrenceId || !userId) {
      return res.status(400).json({
        success: false,
        msg: "paymentRefrenceId and userId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid userId",
      });
    }

    const order = await Order.findOne({
      userId: userId,
      phonePeTransactionId: paymentRefrenceId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        msg: "Order not found",
      });
    }

    if (order.paymentStatus === "success") {
      return res.status(200).json({
        success: true,
        msg: "Payment verified successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        msg: "Payment verification failed",
      });
    }
  } catch (error) {
    logger.error("Error while verifying payment: ", error);
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};
