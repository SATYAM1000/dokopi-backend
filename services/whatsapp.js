import axios from "axios";
import { logger } from "../config/logger.config.js";

export const sendWhatsAppNotificationToXeroxStoreOwner = async (
  sendMessageTo,
  newOrderDetails
) => {
  try {
    const response = await axios({
      url: process.env.WHATSAPP_BASE_URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: sendMessageTo,
        type: "template",
        template: {
          name: `${process.env.XEROX_STORE_TEMPLATE_NAME}`,
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "text",
                  text: newOrderDetails.orderNumber || "Not Available",
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: newOrderDetails.storeName,
                },
                {
                  type: "text",
                  text: newOrderDetails.userFilesSent,
                },
                {
                  type: "text",
                  text: newOrderDetails.userAmountPaid,
                },
              ],
            },
          ],
        },
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    logger.error(
      "Error sending WhatsApp notification to xerox store owner:",
      error
    );
  }
};


export const sendWhatsAppNotificationToUser = async (
  sendMessageTo,
  userOrderDetails
) => {
  try {
    const response = await axios({
      url: process.env.WHATSAPP_BASE_URL,
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: sendMessageTo,
        type: "template",
        template: {
          name: `${process.env.USER_ORDER_STATUS_TEMPLATE_NAME}`,
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "text",
                  text: userOrderDetails.orderStatus,
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: userOrderDetails.userName,
                },
                {
                  type: "text",
                  text: userOrderDetails.storeName,
                },
                {
                  type: "text",
                  text: userOrderDetails.orderStatus,
                },
                {
                  type: "text",
                  text: userOrderDetails.filesSent,
                },
                {
                  type: "text",
                  text: userOrderDetails.orderStatus,
                },
                {
                  type: "text",
                  text: userOrderDetails.amountPaid,
                },
              ],
            },
          ],
        },
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    logger.error("Error sending WhatsApp notification to user:", error);
  }
};
