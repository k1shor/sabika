import crypto from "crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token || ""))
    .digest("hex");
}

export function tokenExpiry() {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

export { TOKEN_TTL_MS };