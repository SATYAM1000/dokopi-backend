import {
  fetchXeroxStoreImages,
  getStoreBasicDetails,
  getStorePricing,
  getXeroxStoreOpenCloseHours,
  setXeroxStoreOpenCloseHours,
  updateStoreBasicDetails,
  uploadXeroxStoreImages,
  ConfigurStorePrice,
  NewPriceList,
  deleteXeroxStoreImages,
  storeBankDetailsOfXeroxStore,
  fetchXeroxStoreBankDetails,
  supportFormForXeroxStore,
  getStartedForm,
  fetchHomeDeliveryAndInstantDeliveryConfigurations,
  saveInstantDeliveryConfigurations,
  saveHomeDeliveryConfigurations,
} from "../../controllers/merchant/store.controller.js";
import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import { verifyUser } from "../../middlewares/user.middleware.js";
import { Router } from "express";
import upload from "../../middlewares/multer.middleware.js";

const merchantStoreRouter = Router();

//Endpoint to submit get started form for xerox store
merchantStoreRouter.post("/get-started", verifyUser, getStartedForm);

// Endpoint to fetch store pricing
merchantStoreRouter.get("/pricing/:storeId", getStorePricing);

//Endpoint to get basic store details
merchantStoreRouter.get(
  "/basic-details/:storeId",
  verifyMerchant,
  getStoreBasicDetails
);

//Endpoint to update store basic details
merchantStoreRouter.put(
  "/basic-details/:storeId",
  verifyMerchant,
  updateStoreBasicDetails
);

//Endpoint to store xerox shop images
merchantStoreRouter.post(
  "/store-images/:storeId",
  verifyMerchant,
  upload.single("file"),
  uploadXeroxStoreImages
);

//Endpoint to delete xerox store images
merchantStoreRouter.delete(
  "/store-images/:storeId",
  verifyMerchant,
  deleteXeroxStoreImages
);

//Endpoint to fetch xerox store images
merchantStoreRouter.get(
  "/store-images/:storeId",
  verifyMerchant,
  fetchXeroxStoreImages
);

//Endpoint to set xerox store opening and closing hours
merchantStoreRouter.post(
  "/store-opening-closing-hours/:storeId",
  verifyMerchant,
  setXeroxStoreOpenCloseHours
);

// Endpoint to get xerox store opening and closing hours
merchantStoreRouter.get(
  "/store-opening-closing-hours/:storeId",
  verifyMerchant,
  getXeroxStoreOpenCloseHours
);

//Endpoint to update and create Price List for store
merchantStoreRouter.post(
  "/configure-price",
  verifyMerchant,
  ConfigurStorePrice
);

//Endpoint to fetch Price List for store
merchantStoreRouter.get(
  "/new-price-list/:storeId",
  verifyMerchant,
  NewPriceList
);

//Endpoint to save - update bank details of xerox store
merchantStoreRouter.post(
  "/store-bank-details/:storeId",
  verifyMerchant,
  storeBankDetailsOfXeroxStore
);

//Endpoint to fetch bank details of xerox store
merchantStoreRouter.get(
  "/store-bank-details/:storeId",
  verifyMerchant,
  fetchXeroxStoreBankDetails
);

// Endpoint to submit support form for xerox store only
merchantStoreRouter.post(
  "/support/:storeId",
  verifyMerchant,
  supportFormForXeroxStore
);

// Endpoint to fetch status of instant delivery and home delivery of particular store
merchantStoreRouter.get(
  "/instant-delivery-status/:storeId",
  verifyMerchant,
  fetchHomeDeliveryAndInstantDeliveryConfigurations
);

// Endpoint to save instant delivery configurations of particular store
merchantStoreRouter.put(
  "/instant-delivery-configurations/:storeId",
  verifyMerchant,
  saveInstantDeliveryConfigurations
);

// Endpoint to save home delivery configurations of particular store
merchantStoreRouter.put(
  "/home-delivery-configurations/:storeId",
  verifyMerchant,
  saveHomeDeliveryConfigurations
);

export default merchantStoreRouter;
