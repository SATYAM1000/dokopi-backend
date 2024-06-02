import path from "path";
import { logger } from "../../config/logger.config.js";
import { createInvoice } from "../../utils/create-invoice.js";
import { User } from "../../models/user.model.js";
import { XeroxStore } from "../../models/store.model.js";
import { Order } from "../../models/order.model.js";
import mongoose from "mongoose";
import fs from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateInvoiceByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        msg: "Invalid order id!",
        success: false,
      });
    }

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(404).json({
        msg: "Order not found!",
        success: false,
      });
    }

    const sanitizedOrderNumber = order.orderNumber.replace(/[^\w]/g, "");
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      "public",
      "invoice",
      `${Date.now()}-${sanitizedOrderNumber}.pdf`
    );

    if (order.paymentStatus !== "paid") {
      return res.status(400).json({
        msg: "Payment not successful!",
        success: false,
      });
    }

    const userInfo = await User.findById(order.userId);
    if (!userInfo) {
      return res.status(404).json({
        msg: "User not found!",
        success: false,
      });
    }

    const storeInfo = await XeroxStore.findById(order.storeId);
    if (!storeInfo) {
      return res.status(404).json({
        msg: "Store not found!",
        success: false,
      });
    }

    const invoice = generateInvoiceData(order, userInfo, storeInfo);

    await createInvoice(invoice, filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${sanitizedOrderNumber}.pdf`);
    
    res.download(filePath, `${sanitizedOrderNumber}.pdf`, async (err) => {
      if (err) {
        logger.error("Error downloading the file:", err);
        return res.status(500).send("Error downloading the file");
      }
      await deleteInvoiceFile(filePath); // Ensure deletion after sending
    });
  } catch (error) {
    logger.error(`Error while generating invoice: ${error.message}`);
    return res.status(500).json({
      msg: "Internal server error!",
      error: error.message,
      success: false,
    });
  }
};

async function deleteInvoiceFile(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
  } catch (error) {
    logger.error("Error deleting the file:", error);
  }
}

function generateInvoiceData(order, userInfo, storeInfo) {
  const userSelectedItems = order.cartItems.map((item) => {
    return {
      name: item.fileOriginalName,
      no_of_copies: item.fileCopiesCount,
      type: item.fileColorType,
      print_mode: item.filePrintMode,
      total_pages: item.filePageCount,
      color_pages_to_print:
        item.fileColorPagesToPrint.length > 0
          ? item.fileColorPagesToPrint.sort((a, b) => a - b).join(", ")
          : "NA",
    };
  });

  return {
    shipping: {
      name: userInfo.name,
      email: userInfo.email,
    },
    items: userSelectedItems,
    subtotal: order.totalPrice,
    Status: order.paymentStatus,
    Order_no: order.orderNumber,
    order_date: order.createdAt.toLocaleDateString(),
    paymentId: order.razorpayPaymentId,
    status: order.paymentStatus,
    storeName: storeInfo.storeDetails.storeName,
    storePhoneNumber: storeInfo.storeDetails.storePhoneNumber,
    storeEmail: storeInfo.storeDetails.storeEmail,
    storeLocation:
      storeInfo.storeDetails.storeLocation.storeLandmark +
      ", " +
      storeInfo.storeDetails.storeLocation.storeCity +
      ", " +
      storeInfo.storeDetails.storeLocation.storeState +
      ", " +
      storeInfo.storeDetails.storeLocation.storeZipCode,
  };
}
