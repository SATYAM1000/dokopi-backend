import { Router } from "express";
import { getAnalyticsDataForTimeRange } from "../../controllers/merchant/charts.controller.js";
import { verifyMerchant } from "../../middlewares/merchant.middleware.js";

export const chartRouter = Router();

chartRouter.get(
  "/analytics/:storeId/:timeRange",
  verifyMerchant,
  getAnalyticsDataForTimeRange
);
