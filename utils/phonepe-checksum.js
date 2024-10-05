import crypto from "crypto";
export const generatePhonePeChecksum = (data, SALT_KEY) => {
  if (!data) {
    return null;
  }
  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const keyIndex = 1;
  const string = payloadMain + "/pg/v1/pay" + SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;
  return {
    checksum,
    payloadMain,
  };
};

