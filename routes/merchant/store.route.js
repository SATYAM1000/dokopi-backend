import {
  changeStoreStatus,
  createNewXeroxStore,
  getStoreBasicDetails,
  getStorePricing,
  updateStoreBasicDetails,
} from "../../controllers/merchant/store.controller.js";
import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import { Router } from "express";

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
merchantStoreRouter.get("/basic-details/:storeId", verifyMerchant,getStoreBasicDetails);

//Endpoint to update store basic details
merchantStoreRouter.put("/basic-details/:storeId", verifyMerchant,updateStoreBasicDetails);

export default merchantStoreRouter;
