import { readFileSync } from "fs";
import { OdtCounter, PdfCounter, PptxCounter } from "page-count";
import { logger } from "../config/logger.config.js";
import getDocxPageCount from "./docx-page-count.js";

export const pageCounter = async (filePath, extension) => {
  try {
    if (["docx", "pdf", "pptx", "odt", "Pdf"].includes(extension)) {
      const fileBuffer = readFileSync(filePath);
      let pageCount;

      switch (extension) {
        case "docx":
          pageCount = await getDocxPageCount(filePath);
          if (pageCount === undefined) {
            logger.error(
              "Error counting pages for docx file. Page count unavailable."
            );
            return null;
          }
          break;
        case "pdf":
          pageCount = await PdfCounter.count(fileBuffer);
          break;
        case "Pdf":
          pageCount = await PdfCounter.count(fileBuffer);
          break;
        case "pptx":
          pageCount = await PptxCounter.count(fileBuffer);
          break;
        case "odt":
          pageCount = await OdtCounter.count(fileBuffer);
          break;
        default:
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
