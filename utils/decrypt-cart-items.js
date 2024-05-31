import { decryptFileUrl } from "./decrypt-file-url.js";
export function decryptCartItems(cartItems) {
  return cartItems.map((item) => {
    if (!item.fileURL) return null;
    return {
      ...item,
      fileURL: decryptFileUrl(item.fileURL),
    };
  });
}