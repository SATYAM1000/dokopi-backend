import axios from "axios";
import { logger } from "../config/logger.config";

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
          name: process.env.WHATSAPP_TEMPLATE_NAME_FOR_XEROX_STORE,
          language: {
            code: "en",
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
                  text: "DoKopi", // Adjust if needed to be dynamic
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
          name: process.env.WHATSAPP_TEMPLATE_NAME_FOR_USER,
          language: {
            code: "en",
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
    logger.error("Error sending WhatsApp notification to user:", error);
  }
};
