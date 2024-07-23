import { logger } from "../../config/logger.config.js";
import mongoose from "mongoose";
import { XeroxStore } from "../../models/store.model.js";
import { Order } from "../../models/order.model.js";

export const getXeroxStoreOrdersById = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        code: "INVALID_STORE_ID",
        msg: "Store id is invalid!",
        success: false,
      });
    }

    const store = await XeroxStore.findById(storeId);
    if (!store) {
      return res.status(404).json({
        code: "STORE_NOT_EXIST",
        msg: "Store not exist!",
        success: false,
      });
    }

    if (!store.isStoreSetupComplete) {
      return res.status(400).json({
        code: "SETUP_INCOMPLETE",
        storeSetUpProgress: store.storeSetUpProgress,
        msg: "Store setup is not completed. Please complete the store setup.",
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
          code: "INVALID_DATE_FORMAT",
          msg: "Invalid date format!",
          success: false,
        });
      }

      const IST_OFFSET = 5.5 * 60 * 60 * 1000;

      const startOfDayIST = new Date(selectedDate.getTime() + IST_OFFSET);
      startOfDayIST.setUTCHours(0, 0, 0, 0);

      const endOfDayIST = new Date(selectedDate.getTime() + IST_OFFSET);
      endOfDayIST.setUTCHours(23, 59, 59, 999);

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
        code: "NO_ORDERS_FOUND",
        msg: "No orders found for the specified date.",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Orders fetched successfully!",
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error(`Error while fetching orders: ${error.message}`);
    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
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
      order.isOrderViewedByMerchant = true;
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

export const changeOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const status = req.params.status;

    if (!orderId) {
      return res.status(400).json({
        msg: "Order ID is required",
        success: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        msg: "Invalid order ID",
        success: false,
      });
    }

    if (
      !status ||
      ![
        "pending",
        "processing",
        "rejected",
        "delivered",
        "cancelled",
        "completed",
      ].includes(status)
    ) {
      return res.status(400).json({
        msg: "Status is required",
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

    order.orderStatus = status;
    await order.save();
    return res.status(200).json({
      msg: "Order status changed successfully",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while changing order status: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong",
      error: error.message,
      success: false,
    });
  }
};

export const getTotalOrderDetails = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store ID!",
        success: false,
      });
    }
    const data = await Order.aggregate([
      {
        $match: {
          storeId: new mongoose.Types.ObjectId("665d78f3aa4504eb4abeb726"),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "action",
        },
      },
      {
        $unwind: "$action",
      },
      {
        $addFields: {
          TransactionId: "$phonePeTransactionId",
          amount: "$totalPrice",
          FilesRecvd: {
            $cond: {
              if: {
                $isArray: "$cartItems",
              },
              then: {
                $size: "$cartItems",
              },
              else: "0",
            },
          },
          Status: "$orderStatus",
          Transaction_Time: "$createdAt",
          Order_Id: "$orderNumber",
          ViewDetail: "$cartItems",
        },
      },
      {
        $project: {
          phonePeTransactionId: 0,
          phonePeMerchantUserId: 0,
          totalPrice: 0,
          cartItems: 0,
          storeId: 0,
          orderNumber: 0,
          orderStatus: 0,
          userId: 0,
          isActive: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0,
          "action.createdAt": 0,
          "action.updatedAt": 0,
          "action.socketId": 0,
          "action.__v": 0,
        },
      },
    ]);

    return res.status(200).json({
      msg: "Orders fetched successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      `Error while fetching dashboard Total Orders: ${error.message}`
    );
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};
