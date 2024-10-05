import { File } from "../models/file.model.js";
import { XeroxStore } from "../models/store.model.js";
import { logger } from "../config/logger.config.js";

const PLATFORM_FEES = process.env.PLATFORM_CHARGES || 1.0;
export const calculatePrintingPrice = async (fileId, storeId) => {
  try {
    if (!fileId || !storeId) {
      logger.error("Missing file id or store id");
      return null;
    }

    const file = await File.findById(fileId);
    if (!file) {
      logger.error("File not found");
      throw new Error("File not found");
    }

    const store = await XeroxStore.findById(storeId);
    if (!store) {
      logger.error("Store not found");
      throw new Error("Store not found");
    }

    const {
      basicFileInfo: { filePageCount },
      printSettings: {
        fileCopiesCount,
        fileColorType,
        filePrintMode,
        additionalServices,
      }
    } = file;
    let printingCost = 0;

    if (filePageCount <= 0 || fileCopiesCount <= 0) {
      logger.error("Invalid page count or copies count");
      throw new Error("Invalid page count or copies count");
    }

    if (!store.storePrices) {
      logger.error("Store prices not found");
      throw new Error("Store prices not found");
    }

    if (fileColorType === "black and white") {
      if (filePrintMode === "simplex") {
        printingCost +=
          filePageCount *
          fileCopiesCount *
          store.storePrices.simplexBlackAndWhite;
      } else if (filePrintMode === "duplex") {
        printingCost +=
          filePageCount *
          fileCopiesCount *
          store.storePrices.duplexBlackAndWhite;
      }
    } else if (fileColorType === "color") {
      if (filePrintMode === "simplex") {
        printingCost +=
          filePageCount * fileCopiesCount * store.storePrices.simplexColor;
      } else if (filePrintMode === "duplex") {
        printingCost +=
          filePageCount * fileCopiesCount * store.storePrices.duplexColor;
      }
    }

    if (additionalServices.includes("binding")) {
      printingCost += store.storePrices.binding;
    }

    if (additionalServices.includes("lamination")) {
      printingCost += store.storePrices.lamination;
    }

    if (additionalServices.includes("taping")) {
      printingCost += store.storePrices.taping;
    }

    printingCost += PLATFORM_FEES;
    printingCost = Math.round(printingCost * 100) / 100;
    return printingCost;
  } catch (error) {
    logger.error(`Error calculating printing price: ${error.message}`);
    throw error;
  }
};
