import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import unzipper from "unzipper";
import xml2js from "xml2js";
import { logger } from "../config/logger.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getDocxPageCount = (filePath) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, "temp");
    fs.mkdirSync(tempDir, { recursive: true });

    const rs = fs.createReadStream(filePath);

    rs.on("error", (err) => {
      logger.error(`Error reading file: ${err.message}`);
      reject(`Error reading file: ${err.message}`);
    });

    rs.pipe(unzipper.Parse())
      .on("entry", (entry) => {
        if (entry.path === "docProps/app.xml") {
          let xmlContent = "";
          entry.on("data", (chunk) => {
            xmlContent += chunk.toString();
          });
          entry.on("end", () => {
            xml2js.parseString(xmlContent, (err, result) => {
              if (err) {
                logger.error(`Error parsing XML: ${err.message}`);
                reject(`Error parsing XML: ${err.message}`);
              } else {
                if (
                  result &&
                  result["Properties"] &&
                  result["Properties"]["Pages"] &&
                  result["Properties"]["Pages"][0]
                ) {
                  const pageCount = result["Properties"]["Pages"][0];
                  logger.info(`Page count found: ${pageCount}`);
                  resolve(pageCount);
                } else {
                  logger.error(
                    "Cannot find valid page count information in XML"
                  );
                  reject("Cannot find valid page count information in XML");
                }
              }
            });
          });
        } else {
          entry.autodrain(); // Skip non-relevant entries
        }
      })
      .on("error", (err) => {
        logger.error(`Error extracting DOCX: ${err.message}`);
        reject(`Error extracting DOCX: ${err.message}`);
      })
      .on("finish", () => {
        logger.info("File extraction completed");
        rs.close();
        fs.rmdir(tempDir, { recursive: true }, (err) => {
          if (err) {
            logger.error(`Error removing temp directory: ${err.message}`);
          } else {
            logger.info("Temp directory removed");
          }
        });
      });
  });
};

export default getDocxPageCount;
