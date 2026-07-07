// @/lib/encryption.js
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || "bindfam-secret-key-2025";

export const encryptData = (data) => {
  if (!data || typeof data !== "object") return "";
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
};

export const decryptData = (encrypted) => {
  if (!encrypted || typeof encrypted !== "string" || encrypted.trim() === "") {
    return { childName: "", docTitle: "", notes: "" };
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      return { childName: "[Corrupted]", docTitle: "[Corrupted]", notes: "" };
    }
    return JSON.parse(decrypted);
  } catch (error) {
    console.warn("Decryption failed (possibly old data):", error);
    return { childName: "[Encrypted]", docTitle: "[Unable to decrypt]", notes: "" };
  }
};