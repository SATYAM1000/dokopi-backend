import { XeroxStore } from "../../models/store.model.js";
import { logger } from "../../config/logger.config.js";
import { validateFields } from "../../utils/validate-fields.js";
import mongoose from "mongoose";
import { uploadXeroxStoreImagesToS3 } from "../../utils/store-images-upload.js";
import fs from "fs";
import storeHoursModel from "../../models/store-hours.model.js";
import newPricingModel from "../../models/new.pricing.model.js";

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

export const getStoreBasicDetails = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const store = await XeroxStore.findById(storeId).select([
      "storeDetails.storeRefrenceId",
      "storeDetails.storeName",
      "storeDetails.storePhoneNumber",
      "storeDetails.storeEmail",
      "storeDetails.storeLocation.storeLandmark",
      "storeDetails.storeLocation.storeZipCode",
      "storeDetails.storeLocation.storeCity",
      "storeDetails.storeLocation.storeState",
      "storeLocationCoordinates.coordinates",
    ]);

    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    const responseData = {
      storeRefrenceId: store.storeDetails.storeRefrenceId,
      storeName: store.storeDetails.storeName,
      storePhoneNumber: store.storeDetails.storePhoneNumber,
      storeEmail: store.storeDetails.storeEmail,
      storeLandmark: store.storeDetails.storeLocation.storeLandmark,
      storeZipCode: store.storeDetails.storeLocation.storeZipCode,
      storeCity: store.storeDetails.storeLocation.storeCity,
      storeState: store.storeDetails.storeLocation.storeState,
      storeLatitude: store.storeLocationCoordinates.coordinates[1], // Latitude
      storeLongitude: store.storeLocationCoordinates.coordinates[0], // Longitude
    };

    return res.status(200).json({
      msg: "Store basic details fetched successfully!",
      success: true,
      data: responseData,
    });
  } catch (error) {
    logger.error(`Error while getting store basic details: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const updateStoreBasicDetails = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const {
      storeRefrenceId,
      storeName,
      storePhoneNumber,
      storeEmail,
      storeLocation: {
        storeLandmark,
        storeZipCode,
        storeCity,
        storeState,
        storeLatitude,
        storeLongitude,
      },
    } = req.body;

    let updateObject = {};
    if (storeRefrenceId)
      updateObject["storeDetails.storeRefrenceId"] = storeRefrenceId;
    if (storeName) updateObject["storeDetails.storeName"] = storeName;
    if (storePhoneNumber)
      updateObject["storeDetails.storePhoneNumber"] = storePhoneNumber;
    if (storeEmail) updateObject["storeDetails.storeEmail"] = storeEmail;
    if (storeLandmark)
      updateObject["storeDetails.storeLocation.storeLandmark"] = storeLandmark;
    if (storeZipCode)
      updateObject["storeDetails.storeLocation.storeZipCode"] = storeZipCode;
    if (storeCity)
      updateObject["storeDetails.storeLocation.storeCity"] = storeCity;
    if (storeState)
      updateObject["storeDetails.storeLocation.storeState"] = storeState;
    if (storeLongitude && storeLatitude) {
      updateObject["storeLocationCoordinates.coordinates"] = [
        storeLongitude,
        storeLatitude,
      ];
    }

    const updatedStore = await XeroxStore.findByIdAndUpdate(
      storeId,
      updateObject,
      { new: true, runValidators: true }
    );

    if (!updatedStore) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Store basic details updated successfully!",
      success: true,
      data: updatedStore,
    });
  } catch (error) {
    console.error(`Error while updating store basic details: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const uploadXeroxStoreImages = async (req, res) => {
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

    const filePath = req.file?.path;

    if (req.fileValidationError) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("File validation error");
      return res.status(400).json({
        msg: req.fileValidationError,
        success: false,
      });
    }

    if (!req.file) {
      logger.error("File not found!");
      return res.status(400).json({
        msg: "File not found!",
        success: false,
      });
    }

    const extension = req.file.originalname.split(".").pop();

    if (!["jpg", "jpeg", "png"].includes(extension)) {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      logger.error("Invalid file type. Only JPG, JPEG, PNG allowed.");
      return res.status(400).json({
        msg: "Invalid file type. Only JPG, JPEG, PNG allowed.",
        success: false,
      });
    }

    const fileURL = await uploadXeroxStoreImagesToS3(filePath);

    store.storeImagesURL.push(fileURL);
    await store.save();

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({
      msg: "Store images uploaded successfully!",
      success: true,
      data: fileURL,
    });
  } catch (error) {
    logger.error(`Error while uploading store images: ${error.message}`);

    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const deleteXeroxStoreImages = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const fileURL = req.body.fileURL;
    if (!fileURL) {
      return res.status(400).json({
        msg: "File URL not found!",
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

    const index = store.storeImagesURL.indexOf(fileURL);
    if (index === -1) {
      return res.status(404).json({
        msg: "Image not found!",
        success: false,
      });
    }

    store.storeImagesURL.splice(index, 1);
    await store.save();

    return res.status(200).json({
      msg: "Image deleted successfully!",
      success: true,
      data: store.storeImagesURL,
    });
  } catch (error) {
    logger.error(`Error while deleting store images: ${error.message}`);
    return res.status(500).json({
      msg: error.message,
      error: error.message,
      success: false,
    });
  }
};

export const fetchXeroxStoreImages = async (req, res) => {
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
      msg: "Store images fetched successfully!",
      success: true,
      data: store.storeImagesURL,
    });
  } catch (error) {
    logger.error(`Error while fetching store images: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const setXeroxStoreOpenCloseHours = async (req, res) => {
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

    const timings = req.body;
    console.log("timings", timings);

    if (!timings) {
      return res.status(400).json({
        msg: "Timings not provided!",
        success: false,
      });
    }

    const storeOpeningClosingHours = await storeHoursModel.findOne({
      storeId,
    });

    if (storeOpeningClosingHours) {
      storeOpeningClosingHours.Monday.isOpen = timings.Monday.isOpen;
      storeOpeningClosingHours.Monday.open = timings.Monday.open;
      storeOpeningClosingHours.Monday.close = timings.Monday.close;

      storeOpeningClosingHours.Tuesday.isOpen = timings.Tuesday.isOpen;
      storeOpeningClosingHours.Tuesday.open = timings.Tuesday.open;
      storeOpeningClosingHours.Tuesday.close = timings.Tuesday.close;

      storeOpeningClosingHours.Wednesday.isOpen = timings.Wednesday.isOpen;
      storeOpeningClosingHours.Wednesday.open = timings.Wednesday.open;
      storeOpeningClosingHours.Wednesday.close = timings.Wednesday.close;

      storeOpeningClosingHours.Thursday.isOpen = timings.Thursday.isOpen;
      storeOpeningClosingHours.Thursday.open = timings.Thursday.open;
      storeOpeningClosingHours.Thursday.close = timings.Thursday.close;

      storeOpeningClosingHours.Friday.isOpen = timings.Friday.isOpen;
      storeOpeningClosingHours.Friday.open = timings.Friday.open;
      storeOpeningClosingHours.Friday.close = timings.Friday.close;

      storeOpeningClosingHours.Saturday.isOpen = timings.Saturday.isOpen;
      storeOpeningClosingHours.Saturday.open = timings.Saturday.open;
      storeOpeningClosingHours.Saturday.close = timings.Saturday.close;

      storeOpeningClosingHours.Sunday.isOpen = timings.Sunday.isOpen;
      storeOpeningClosingHours.Sunday.open = timings.Sunday.open;
      storeOpeningClosingHours.Sunday.close = timings.Sunday.close;

      await storeOpeningClosingHours.save();

      return res.status(200).json({
        msg: "Store open/close hours updated successfully!",
        success: true,
      });
    }

    await storeHoursModel.create({
      storeId,
      Monday: {
        open: timings.Monday.open,
        close: timings.Monday.close,
        isOpen: timings.Monday.isOpen,
      },
      Tuesday: {
        open: timings.Tuesday.open,
        close: timings.Tuesday.close,
        isOpen: timings.Tuesday.isOpen,
      },
      Wednesday: {
        open: timings.Wednesday.open,
        close: timings.Wednesday.close,
        isOpen: timings.Wednesday.isOpen,
      },
      Thursday: {
        open: timings.Thursday.open,
        close: timings.Thursday.close,
        isOpen: timings.Thursday.isOpen,
      },
      Friday: {
        open: timings.Friday.open,
        close: timings.Friday.close,
        isOpen: timings.Friday.isOpen,
      },
      Saturday: {
        open: timings.Saturday.open,
        close: timings.Saturday.close,
        isOpen: timings.Saturday.isOpen,
      },
      Sunday: {
        open: timings.Sunday.open,
        close: timings.Sunday.close,
        isOpen: timings.Sunday.isOpen,
      },
    });

    return res.status(200).json({
      msg: "Store open/close hours set successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(
      `Error while setting store open/close hours: ${error.message}`
    );
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const getXeroxStoreOpenCloseHours = async (req, res) => {
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

    const storeOpeningClosingHours = await storeHoursModel.findOne({
      storeId,
    });

    if (!storeOpeningClosingHours) {
      return res.status(404).json({
        msg: "Store open/close hours not found!",
        success: false,
      });
    }
    return res.status(200).json({
      msg: "Store open/close hours fetched successfully!",
      success: true,
      data: storeOpeningClosingHours,
    });
  } catch (error) {
    logger.error(
      `Error while fetching store open/close hours: ${error.message}`
    );
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const ConfigurStorePrice = async (req, res) => {
  try {
    const PriceListRecvdFromUser = req.body.storePriceData;
    const storeId = PriceListRecvdFromUser.storeId
    console.log(req.body);

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }
    //finding docs and updating the values of prices
    let NewPriceList = await newPricingModel.findOneAndUpdate({ storeId }, PriceListRecvdFromUser)

    // if addingPrice is null,then this is new user addingis prices of store then create new storeprice List then continue
    if (!NewPriceList) {
      NewPriceList = await newPricingModel.create(PriceListRecvdFromUser)
      await NewPriceList.save();
    }

    return res.status(201).json({
      msg: "Success",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
}

export const NewPriceList = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const store = await newPricingModel.findOne({ storeId });

    if (!store) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Store pricing fetched successfully!",
      success: true,
      data: store,
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