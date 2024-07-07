import { logger } from "../../config/logger.config.js";
import { xeroxstorepricing } from "../../models/xeroxstorepricing.model.js";
import mongoose from "mongoose";

export const setXeroxStorePricing = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const newPricingRuleRcvd = req.body.newPricingRule;

    if (!newPricingRuleRcvd) {
      return res.status(400).json({
        msg: "Pricing rule not found!",
        success: false,
      });
    }

    const {
      conditionName,
      comparisonOperator,
      conditionValue,
      conditionPrice,
    } = newPricingRuleRcvd;

    const validConditionNames = ["quantity", "urgency"];
    const validComparisonOperators = ["greater_than", "less_than", "equal_to"];

    if (!validConditionNames.includes(conditionName)) {
      return res.status(400).json({
        msg: "Invalid condition name!",
        success: false,
      });
    }

    if (!validComparisonOperators.includes(comparisonOperator)) {
      return res.status(400).json({
        msg: "Invalid comparison operator!",
        success: false,
      });
    }

    if (
      typeof conditionValue !== "number" ||
      typeof conditionPrice !== "number"
    ) {
      return res.status(400).json({
        msg: "Condition value and condition price must be numbers!",
        success: false,
      });
    }

    // Find the pricing document for the store
    let storePricing = await xeroxstorepricing.findOne({ storeId });

    if (!storePricing) {
      storePricing = new xeroxstorepricing({ storeId, priceList: [] });
    }

    const printType = req.body.printType;
    const printingSides = req.body.printingSides;
    const paperSize = req.body.paperSize;
    const basePrice = req.body.basePrice;

    if (
      !printType ||
      !printingSides ||
      !paperSize ||
      typeof basePrice !== "number"
    ) {
      return res.status(400).json({
        msg: "Missing or invalid print configuration details!",
        success: false,
      });
    }

    const validPrintTypes = [
      "black_and_white",
      "simple_color",
      "digital_color",
    ];
    const validPrintingSides = ["single_sided", "double_sided"];
    const validPaperSizes = ["A0", "A1", "A2", "A3", "A4", "A5"];

    if (
      !validPrintTypes.includes(printType) ||
      !validPrintingSides.includes(printingSides) ||
      !validPaperSizes.includes(paperSize)
    ) {
      return res.status(400).json({
        msg: "Invalid print type, printing sides, or paper size!",
        success: false,
      });
    }

    const newPricingRule = {
      conditionName,
      comparisonOperator,
      conditionValue,
      conditionPrice,
    };

    const existingConfiguration = storePricing.priceList.find(
      (config) =>
        config.printType === printType &&
        config.printingSides === printingSides &&
        config.paperSize === paperSize
    );

    if (existingConfiguration) {
      existingConfiguration.conditionsList.push(newPricingRule);
    } else {
      storePricing.priceList.push({
        printType,
        printingSides,
        basePrice,
        paperSize,
        conditionsList: [newPricingRule],
      });
    }

    await storePricing.save();

    return res.status(200).json({
      msg: "Pricing rule added successfully!",
      success: true,
    });
  } catch (error) {
    logger.error(`Error while setting v2 pricing: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

export const getXeroxStorePricing = async (req, res) => {
  try {
    const storeId = req.params.storeId;
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        msg: "Invalid store id!",
        success: false,
      });
    }

    const storePricing = await xeroxstorepricing.findOne({ storeId });
    if (!storePricing) {
      return res.status(404).json({
        msg: "Store pricing not found!",
        success: false,
      });
    }

    return res.status(200).json({
      msg: "Store pricing fetched successfully!",
      success: true,
      data: storePricing,
    });
  } catch (error) {
    logger.error(`Error while getting xerox store pricing: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};
