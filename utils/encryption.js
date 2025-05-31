// utils/encryption.js
const crypto = require("crypto");

const secretKey = process.env.MESSAGE_SECRET_KEY || "fallback-secret-key";
const algorithm = "aes-256-cbc"; // must be 256-bit key for this algo
const key = crypto.createHash("sha256").update(String(secretKey)).digest("base64").substr(0, 32);

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // we return iv + encryptedText
}

// Decrypt function
function decrypt(encrypted) {
  const parts = encrypted.split(":");
  if (parts.length !== 2) throw new Error("Invalid encrypted message format");

  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
