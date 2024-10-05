import { google } from "googleapis";
import { logger } from "./logger.config.js";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

// Function to access Google Sheets
async function accessGoogleSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEET_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ).replace(/\\'/g, "'"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const client = await auth.getClient();
    return google.sheets({ version: "v4", auth: client }).spreadsheets.values;
  } catch (error) {
    logger.error("Error accessing Google Sheets API:", error);
    throw new Error("Failed to access Google Sheets API");
  }
}

async function setColumnHeadings() {
  const headings = [
    "Order Number",
    "Order Date",
    "Order ID",
    "User ID",
    "Store ID",
    "Total Items",
    "Total Price",
    "Platform Fee",
    "Payment Status",
  ];

  try {
    const sheets = await accessGoogleSheets();
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A1";

    const resource = {
      values: [headings],
    };

    const response = await sheets.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "RAW",
      resource,
    });
  } catch (error) {
    logger.error("Error setting column headings in Google Sheets:", error);
    throw new Error("Failed to set column headings in Google Sheets");
  }
}

// Function to append a dynamic order to Google Sheets
async function appendOrderToSheet(order) {
  return retryOperation(async () => {
    try {
      const sheets = await accessGoogleSheets();
      const sheetId = process.env.GOOGLE_SHEET_ID;
      const range = "Sheet1!A2";
      const valueInputOption = "RAW";
      const orderValues = [
        order.orderNumber,
        new Date(order.createdAt).toLocaleDateString(),
        order._id,
        order.userId,
        order.storeId,
        order.cartItems.length,
        order.totalPrice,
        order.platformFee,
        order.paymentStatus,
      ];

      const resource = {
        values: [orderValues],
      };

      const response = await sheets.append({
        spreadsheetId: sheetId,
        range,
        valueInputOption,
        resource,
      });
    } catch (error) {
      logger.error("Error appending order to Google Sheets:", error);
      throw new Error("Failed to append order to Google Sheets");
    }
  });
}

// Retry logic with exponential backoff
async function retryOperation(operation, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries) {
        logger.error(`Operation failed after ${retries} attempts:`, error);
        throw error;
      }
      const delay = RETRY_DELAY * attempt;
      logger.warn(
        `Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}


export { appendOrderToSheet, setColumnHeadings, retryOperation };
