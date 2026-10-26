import CryptoJS from "crypto-js";

const SECRET_KEY = "9kL2mNpQrS7tUvWxYzA1B2C3D4E5F6G7H8I9J0K1L2M";

export const encryptPayload = (data) => {
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
};

export const wrapEncrypted = (data) => ({
  encryptedData: encryptPayload(data),
});
