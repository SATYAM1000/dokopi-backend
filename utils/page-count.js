import { readFileSync } from "fs";
import { DocxCounter, OdtCounter, PdfCounter, PptxCounter } from "page-count";
import { logger } from "../config/logger.config.js";

export const pageCounter = async (filePath, extension) => {
  try {
    if (["docx", "pdf", "pptx", "odt"].includes(extension)) {
      const fileBuffer = readFileSync(filePath);
      let pageCount;

      switch (extension) {
        case "docx":
          pageCount = await DocxCounter.count(fileBuffer);
          break;
        case "pdf":
          pageCount = await PdfCounter.count(fileBuffer);
          break;
        case "pptx":
          pageCount = await PptxCounter.count(fileBuffer);
          break;
        case "odt":
          pageCount = await OdtCounter.count(fileBuffer);
          break;
        default:
          // Handle unsupported file extensions
          pageCount = null;
      }

      return pageCount;
    } else if (["jpg", "jpeg", "png"].includes(extension)) {
      return 1;
    } else {
      logger.error(`Unsupported file extension: ${extension}`);
      throw new Error(`Unsupported file extension: ${extension}`);
    }
  } catch (error) {
    logger.error(`Error while counting pages: ${error.message}`);
    return null;
  }
};
