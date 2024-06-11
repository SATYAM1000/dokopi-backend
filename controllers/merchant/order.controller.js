import { logger } from "../../config/logger.config.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";
import { XeroxStore } from "../../models/store.model.js";

export const getXeroxStoreOrdersById = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store ID!",
        success: false,
      });
    }

    const store = await XeroxStore.findById(storeId);
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    const query = {
      storeId: storeId,
      paymentStatus: "success",
    };

    if (date) {
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        return res.status(400).json({
          msg: "Invalid date format!",
          success: false,
        });
      }

      // Convert the selected date to IST and set the start and end of the day in IST
      const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds

      const startOfDayIST = new Date(selectedDate.getTime() + IST_OFFSET);
      startOfDayIST.setUTCHours(0, 0, 0, 0);

      const endOfDayIST = new Date(selectedDate.getTime() + IST_OFFSET);
      endOfDayIST.setUTCHours(23, 59, 59, 999);

      // Convert the start and end of the day back to UTC
      const startOfDayUTC = new Date(startOfDayIST.getTime() - IST_OFFSET);
      const endOfDayUTC = new Date(endOfDayIST.getTime() - IST_OFFSET);

      query.createdAt = {
        $gte: startOfDayUTC,
        $lt: endOfDayUTC,
      };
    } else {
      query.createdAt = {
        $gte: store.storeOpenedAt,
      };
    }

    const orders = await Order.find(query)
      .select("-__v -userId -storeId -phonePeMerchantUserId -updatedAt")
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone image")
      .exec();

    if (!orders || !orders.length) {
      return res.status(404).json({
        msg: "No orders found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Orders fetched successfully!",
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(`Error while fetching orders: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const isOrderViewed = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        msg: "Invalid order ID",
        success: false,
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        msg: "Order not found",
        success: false,
      });
    }

    if (!order.isViewed) {
      order.isViewed = true;
      order.orderStatus = "processing";
      await order.save();

      return res.status(200).json({
        msg: "Order viewed successfully",
        success: true,
      });
    }

    return res.status(200).json({
      msg: "Order already viewed",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while setting order viewed: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
};
