import CryptoJS from "crypto-js";

export const decryptFileUrl = (url) => {
  const bytes = CryptoJS.AES.decrypt(url, process.env.FILE_URL_DECRYPTION_KEY);
  const originalData = bytes.toString(CryptoJS.enc.Utf8);
  return originalData;
};