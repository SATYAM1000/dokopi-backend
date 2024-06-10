import { XeroxStore } from "../../models/store.model.js";
import { logger } from "../../config/logger.config.js";
import { validateFields } from "../../utils/validate-fields.js";
import mongoose from "mongoose";

export const createNewXeroxStore = async (req, res) => {
  try {
    const userId = req.user._id;

    const requiredFields = [
      "storeName",
      "storePhoneNumber",
      "storeEmail",
      "storeLocation",
      "storeLogoURL",
      "storeOpeningHours",
      "storeServices",
      "storeDescription",
      "storeImagesURL",
      "storePrices",
    ];
    const isValid = validateFields(req.body, requiredFields);
    if (!isValid) {
      return res.status(400).json({
        msg: "All fields are required!",
        success: false,
      });
    }

    const isUserAlreadyOwnerOfStore = await XeroxStore.findOne({
      storeOwner: userId,
    });
    if (isUserAlreadyOwnerOfStore) {
      return res.status(400).json({
        msg: "User already owns a store!",
        success: false,
      });
    }

    const {
      storeName,
      storePhoneNumber,
      storeEmail,
      storeLocation,
      storeLocationCoordinates,
      storeLogoURL,
      storeOpeningHours,
      storeServices,
      storeDescription,
      storeImagesURL,
      storePrices,
    } = req.body;

    const newStore = new XeroxStore({
      storeDetails: {
        storeName,
        storePhoneNumber,
        storeEmail,
        storeLocation,
        storeLogoURL,
        storeOpeningHours,
        storeServices,
        storeDescription,
      },
      storeLocationCoordinates,
      storeImagesURL,
      storePrices,
      storeOwner: userId,
    });

    await newStore.save();

    return res.status(201).json({
      msg: "Store created successfully!",
      success: true,
      newStoreId: newStore._id,
    });
  } catch (error) {
    logger.error(`Error while creating new store: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};


export const changeStoreStatus = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const state = req.params.state;

    if (state !== "open" && state !== "closed") {
      return res.status(400).json({
        msg: "Invalid store status!",
        success: false,
      });
    }
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
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

    store.storeCurrentStatus = state;
    if (state === "open") {
      store.storeOpenedAt = new Date();
      store.isStoreOpen = true;
      await store.save();
      return res.status(200).json({
        msg: "Store opened successfully",
        success: true,
        storeStatus: store.storeStatus,
        state: store.storeCurrentStatus,
      });
    } else {
      store.storeOpenedAt = null;
      store.isStoreOpen = false;
      await store.save();
      return res.status(200).json({
        msg: "Store closed successfully",
        success: true,
        storeStatus: store.storeStatus,
        state: store.storeCurrentStatus,
      });
    }
  } catch (error) {
    logger.error(`Error while changing store status: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

// DELETE /api/merchant/stores/:storeId
export const deleteMerchantStoreById = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    const userId = req.user._id;

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
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

    if (store.storeOwner.toString() !== userId) {
      return res.status(403).json({
        msg: "You are not authorized to perform this action!",
        success: false,
      });
    }

    await store.remove();

    return res.status(200).json({
      msg: "Store deleted successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while deleting store: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const getStorePricing = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
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

    return res.status(200).json({
      msg: "Store pricing fetched successfully!",
      success: true,
      data: store.storePrices,
    });
  } catch (error) {
    logger.error(`Error while getting store pricing: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
