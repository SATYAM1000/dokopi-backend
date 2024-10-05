import { Order } from "../../models/order.model.js";
import { logger } from "../../config/logger.config.js";
import mongoose from "mongoose";
export const checkUserActiveOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const activeOrders = await Order.find({
      userId: userId,
      isOrderActive: true,
      paymentStatus: "success",
      orderStatus: { $in: ["rejected", "pending", "processing", "printed"] },
    })
      .select("-__v -userId -storeId -phonePeMerchantUserId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!activeOrders || !activeOrders.length) {
      return res.status(404).json({
        msg: "No active orders found!",
        success: false,
      });
    }

    const totalOrders = await Order.countDocuments({
      userId: userId,
      isOrderActive: true,
      paymentStatus: "success",
      orderStatus: { $in: ["rejected", "pending", "processing", "printed"] },
    });
    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      msg: "Active orders fetched successfully!",
      success: true,
      data: activeOrders,
      currentPage: page,
      totalPages: totalPages,
      totalOrders: totalOrders,
    });
  } catch (error) {
    logger.error(`Error while checking user active orders: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const fetchUserOrdersHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const orders = await Order.find({
      userId: userId,
      isOrderActive: false,
      paymentStatus: { $in: ["success", "failed", "cancelled", "refunded"] },
      orderStatus: { $in: ["delivered", "rejected"] },
    })
      .select("-__v -userId -storeId -phonePeMerchantUserId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders || !orders.length) {
      return res.status(404).json({
        msg: "No orders found!",
        success: false,
      });
    }

    const totalOrders = await Order.countDocuments({
      userId: userId,
      isOrderActive: false,
      paymentStatus: { $in: ["success", "refunded"] },
      orderStatus: { $in: ["delivered", "rejected"] },
    });
    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      msg: "Orders history fetched successfully!",
      success: true,
      data: orders,
      currentPage: page,
      totalPages: totalPages,
      totalOrders: totalOrders,
    });
  } catch (error) {
    logger.error(`Error while fetching user orders history: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const getOrderDetailsById = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        msg: "Invalid order id!",
        success: false,
      });
    }

    const order = await Order.findOne({ _id: orderId })
      .select("-__v -userId -phonePeMerchantUserId -updatedAt")
      .populate({
        path: "storeId",
        select:
          "storeDetails.storeName storeDetails.storePhoneNumber storeDetails.storeEmail storeDetails.storeLocation -_id",
      });

    if (!order) {
      return res.status(404).json({
        msg: "Order not found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Order details fetched successfully!",
      success: true,
      data: order,
    });
  } catch (error) {
    logger.error(`Error while fetching order details: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
