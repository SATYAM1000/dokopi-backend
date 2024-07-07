import express from "express";
import {
  getXeroxStorePricing,
  setXeroxStorePricing,
} from "../../controllers/merchant/price.controller.js";

export const xeroxStorePriceRouter = express.Router();

//End point to set xerox store pricing
xeroxStorePriceRouter.post("/set/:storeId", setXeroxStorePricing);

//End point to get xerox store pricing
xeroxStorePriceRouter.get("/get/:storeId", getXeroxStorePricing);
