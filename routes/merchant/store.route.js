import {
  changeStoreStatus,
  createNewXeroxStore,
  fetchXeroxStoreImages,
  getStoreBasicDetails,
  getStorePricing,
  getXeroxStoreOpenCloseHours,
  setXeroxStoreOpenCloseHours,
  updateStoreBasicDetails,
  uploadXeroxStoreImages,
  ConfigurStorePrice,
  NewPriceList,
  deleteXeroxStoreImages
} from "../../controllers/merchant/store.controller.js";
import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import { Router } from "express";
import upload from "../../middlewares/multer.middleware.js";

const merchantStoreRouter = Router();

// Endpoint to create a new Xerox store
merchantStoreRouter.post(
  "/create-new-store",
  verifyMerchant,
  createNewXeroxStore
);

// Endpoint to fetch store pricing
merchantStoreRouter.get("/pricing/:storeId", getStorePricing);

// Endpoint to change store status --> open/closed
merchantStoreRouter.put(
  "/change-store-status/:storeId/:state",
  verifyMerchant,
  changeStoreStatus
);

//Endpoint to get basic store details
merchantStoreRouter.get("/basic-details/:storeId", verifyMerchant, getStoreBasicDetails);

//Endpoint to update store basic details
merchantStoreRouter.put("/basic-details/:storeId", verifyMerchant, updateStoreBasicDetails);

//Endpoint to store xerox shop images
merchantStoreRouter.post("/store-images/:storeId", verifyMerchant, upload.single("file"), uploadXeroxStoreImages);

//Endpoint to delete xerox store images
merchantStoreRouter.delete("/store-images/:storeId", verifyMerchant, deleteXeroxStoreImages);

//Endpoint to fetch xerox store images
merchantStoreRouter.get("/store-images/:storeId", verifyMerchant, fetchXeroxStoreImages);

//Endpoint to set xerox store opening and closing hours
merchantStoreRouter.post("/store-opening-closing-hours/:storeId", verifyMerchant, setXeroxStoreOpenCloseHours);

// Endpoint to get xerox store opening and closing hours
merchantStoreRouter.get("/store-opening-closing-hours/:storeId", verifyMerchant, getXeroxStoreOpenCloseHours);

//Endpoint to update and create Price List for store
merchantStoreRouter.post("/configure-price", verifyMerchant, ConfigurStorePrice)

//Endpoint to fetch Price List for store
merchantStoreRouter.get("/new-price-list/:storeId", verifyMerchant, NewPriceList)


export default merchantStoreRouter;
