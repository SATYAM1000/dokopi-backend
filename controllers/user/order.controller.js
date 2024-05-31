import { Order } from "../../models/order.model.js";
import { logger } from "../../config/logger.config.js";
export const checkUserActiveOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const activeOrders = await Order.find({ userId: userId, isActive: true });
    if (!activeOrders || !activeOrders.length) {
      return res.status(404).json({
        msg: "No active orders found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Active orders fetched successfully!",
      success: true,
      data: activeOrders,
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

    const orders = await Order.find({ userId: userId }).select("-__v -userId -storeId -razorpaySignature -razorpayOrderId") 
      .sort({ createdAt: -1 }) 
      .skip(skip)
      .limit(limit);

    if (!orders || !orders.length) {
      return res.status(404).json({
        msg: "No orders found!",
        success: false,
      });
    }

    const totalOrders = await Order.countDocuments({ userId: userId });
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
