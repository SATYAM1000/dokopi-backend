import {
  checkIsXeroxStoreOpen,
  fetchNearestStores,
  fetchSingleStoreDetailsById,
  getAllStores,
  getSingleStoreDetailForSEO,
  searchStores,
} from "../../controllers/user/store.controller.js";
import { Router } from "express";

const userStoreRouter = Router();

// Endpoint to fetch nearest stores (PUBLIC ENDPOINT)
userStoreRouter.get("/nearest-stores", fetchNearestStores);

// Endpoint to fetch store details (PUBLIC ENDPOINT)
userStoreRouter.get("/get-store-info/:storeId", fetchSingleStoreDetailsById);

// Endpoint to provide search results (PUBLIC ENDPOINT)
userStoreRouter.get("/search", searchStores);

// Endpoint to get all stores for seo purpose (PUBLIC ENDPOINT)
userStoreRouter.get("/all", getAllStores);

// Endpoint to get details for seo purpose (PUBLIC ENDPOINT)
userStoreRouter.get("/:storeId", getSingleStoreDetailForSEO);

// Endpoint to check is xerox store open
userStoreRouter.get("/is-open/:storeId", checkIsXeroxStoreOpen);

export default userStoreRouter;
