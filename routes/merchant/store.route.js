import { createNewXeroxStore, getStorePricing } from "../../controllers/merchant/store.controller.js";
import { verifyMerchant } from "../../middlewares/merchant.middleware.js";
import { Router } from "express";


const merchantStoreRouter = Router();

// Endpoint to create a new Xerox store
merchantStoreRouter.post("/create-new-store",verifyMerchant, createNewXeroxStore);

// Endpoint to fetch store pricing
merchantStoreRouter.get("/pricing/:storeId", getStorePricing);



export default merchantStoreRouter;