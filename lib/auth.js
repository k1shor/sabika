import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { dbConnect, useDb } from "@/lib/db";
import { User } from "@/models/User";

const COOKIE_NAME = "token";

function mustJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

export function signToken(payload) {
  const secret = mustJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token) {
  const secret = mustJwtSecret();
  return jwt.verify(token, secret);
}

export async function setAuthCookie(token) {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearAuthCookie() {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function readAuthToken() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value || null;
}

export async function getAuthUser() {
  const token = await readAuthToken();
  if (!token) return null;

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return null;
  }

  const baseUser = {
    id: decoded?.sub ? String(decoded.sub) : null,
    name: decoded?.name || null,
    email: decoded?.email || null,
    role: decoded?.role || "user",
  };

  if (!useDb()) return baseUser;

  try {
    await dbConnect();
    if (!baseUser.id) return baseUser;

    const u = await User.findById(baseUser.id).lean();
    if (!u) return baseUser;

    return {
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role || "user",
    };
  } catch {
    return baseUser;
  }
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) return { ok: false, user: null };
  return { ok: true, user };
}

export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return { ok: false, user: null, error: "Unauthorized" };
  if (user.role !== "admin") return { ok: false, user, error: "Forbidden" };
  return { ok: true, user };
}
