import { fetchNearestStores, fetchSingleStoreDetailsById, searchStores } from "../../controllers/user/store.controller.js";
import { Router } from "express";


const userStoreRouter = Router();

// Endpoint to fetch nearest stores (PUBLIC ENDPOINT)
userStoreRouter.get("/nearest-stores", fetchNearestStores);

// Endpoint to fetch store details (PUBLIC ENDPOINT)
userStoreRouter.get("/get-store-info/:storeId", fetchSingleStoreDetailsById);

// Endpoint to provide search results (PUBLIC ENDPOINT)
userStoreRouter.get("/search", searchStores);

export default userStoreRouter;