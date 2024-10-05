import { logger } from "../config/logger.config";
import {
  sendWhatsAppNotificationToUser,
  sendWhatsAppNotificationToXeroxStoreOwner,
} from "../services/whatsapp";

export const sendNotificationOnWhatsApp = async ({
  sendMessageTo,
  userOrderDetails,
  notificationType,
}) => {
  try {
    if (notificationType === "newOrderPlaced") {
      await sendWhatsAppNotificationToXeroxStoreOwner(
        sendMessageTo,
        userOrderDetails
      );
    } else {
      const userNotificationTypes = [
        "orderInitiated",
        "orderPickedUp",
        "orderDelivered",
        "orderRejected",
        "orderPrinted",
      ];

      if (userNotificationTypes.includes(notificationType)) {
        await sendWhatsAppNotificationToUser(sendMessageTo, userOrderDetails);
      } else {
        logger.warn(`Unknown notification type: ${notificationType}`);
      }
    }
  } catch (error) {
    logger.error("Error sending WhatsApp message:", error);
  }
};
