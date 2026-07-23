import crypto from "crypto";

export function hashPasswordResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token || ""))
    .digest("hex");
}