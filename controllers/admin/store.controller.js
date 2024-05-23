import XeroxStore from "../../models/store.model.js";
import { logger } from "../../config/logger.config.js";

export const getAllStores = async (req, res) => {
  try {
    const allStores = await XeroxStore.find().select(
      "storeDetails storeStatus"
    );
    return res.status(200).json({
      msg: "All stores fetched successfully!",
      success: true,
      data: allStores,
    });
  } catch (error) {
    logger.error(`Error while fetching all stores: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const getStoreById = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findById(storeId).select(
      "-createdAt -updatedAt -__v"
    );
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store fetched successfully!",
      success: true,
      data: store,
    });
  } catch (error) {
    logger.error(`Error while fetching store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findByIdAndDelete(storeId);
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store deleted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while deleting store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const verifyStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findByIdAndUpdate(storeId, {
      "storeStatus.isStoreVerified": true,
    });

    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store verified successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while verifying store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const unverifyStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findByIdAndUpdate(storeId, {
      "storeStatus.isStoreVerified": false,
    });
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store unverified successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while unverifying store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const blockStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findByIdAndUpdate(storeId, {
      "storeStatus.isStoreBlocked": true,
    });
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store blocked successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while blocking store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};

export const unblockStore = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    const store = await XeroxStore.findByIdAndUpdate(storeId, {
      "storeStatus.isStoreBlocked": false,
    });
    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store unblocked successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while unblocking store: ${error.message}`);
    return res.status(500).json({
      msg: "Something went wrong!",
      error: error.message,
      success: false,
    });
  }
};


