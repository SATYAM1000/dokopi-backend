import {logger} from "../../config/logger.config.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";
import { XeroxStore } from "../../models/store.model.js";

export const getXeroxStoreOrdersById = async (req, res) => {
  try {
    const storeId = req.params.storeId;
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

    const orders = await Order.find({
      storeId: storeId,
    })
      .select("-__v -userId -storeId -phonePeMerchantUserId -updatedAt ") 
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone image")
      .exec();

    // const orders = await Order.find({
    //   storeId: storeId,
    //   createdAt: { $gte: store.storeOpenedAt },
    // })
    //   .populate("userId", "name email phone image")
    //   .exec();

    return res.status(200).json({
      msg: "Orders fetched successfully!",
      success: true,
      data: orders,
    });
  } catch (error) {
    logger.error(`Error while fetching orders: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};
