// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";
// import { dbConnect, useDb } from "@/lib/db";
// import { User } from "@/models/User";

// const COOKIE_NAME = "token";

// function mustJwtSecret() {
//   const secret = process.env.JWT_SECRET;
//   if (!secret) throw new Error("Missing JWT_SECRET");
//   return secret;
// }

// export function signToken(payload) {
//   const secret = mustJwtSecret();
//   const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
//   return jwt.sign(payload, secret, { expiresIn });
// }

// export function verifyToken(token) {
//   const secret = mustJwtSecret();
//   return jwt.verify(token, secret);
// }

// export async function setAuthCookie(token) {
//   const store = await cookies();
//   store.set({
//     name: COOKIE_NAME,
//     value: token,
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//   });
// }

// export async function clearAuthCookie() {
//   const store = await cookies();
//   store.set({
//     name: COOKIE_NAME,
//     value: "",
//     httpOnly: true,
//     sameSite: "lax",
//     secure: process.env.NODE_ENV === "production",
//     path: "/",
//     maxAge: 0,
//   });
// }

// export async function readAuthToken() {
//   const store = await cookies();
//   return store.get(COOKIE_NAME)?.value || null;
// }

// export async function getAuthUser() {
//   const token = await readAuthToken();
//   if (!token) return null;

//   let decoded;
//   try {
//     decoded = verifyToken(token);
//   } catch {
//     return null;
//   }

//   const baseUser = {
//     id: decoded?.sub ? String(decoded.sub) : null,
//     name: decoded?.name || null,
//     email: decoded?.email || null,
//     role: decoded?.role || "user",
//   };

//   if (!useDb()) return baseUser; 

//   try {
//     await dbConnect();
//     if (!baseUser.id) return baseUser;

//     const u = await User.findById(baseUser.id).lean();
//     if (!u) return baseUser;

//     return {
//       id: String(u._id),
//       name: u.name,
//       email: u.email,
//       role: u.role || "user",
//     };
//   } catch {
//     return baseUser;
//   }
// }

// export async function requireUser() {
//   const user = await getAuthUser();
//   if (!user) return { ok: false, user: null };
//   return { ok: true, user };
// }

// export async function requireAdmin() {
//   const user = await getAuthUser();
//   if (!user) return { ok: false, user: null, error: "Unauthorized" };
//   if (user.role !== "admin") return { ok: false, user, error: "Forbidden" };
//   return { ok: true, user };
// }
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { User } from "@/models/User";
import { dbConnect, isDbEnabled } from "./db";

const COOKIE_NAME = "token";
const TOKEN_MAX_AGE = 60 * 60 * 24;
const VALID_ROLES = new Set(["visitor", "blog_writer", "admin"]);

function secret() {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return process.env.JWT_SECRET;
}

function normalizeRole(user) {
  if (user?.isAdmin) return "admin";
  if (VALID_ROLES.has(user?.role)) return user.role;
  return "visitor";
}

function toSafeUser(user) {
  const role = normalizeRole(user);

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role,
    isVerified: Boolean(user.isVerified),
    writerVerification: {
      status: user.writerVerification?.status || "none",
      category: user.writerVerification?.category || null,
    },
  };
}

export function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
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
    maxAge: TOKEN_MAX_AGE,
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
  const userId = decoded?.id || decoded?.sub;
  if (!userId) return null;
  const baseUser = {
    id: String(userId),
    name: decoded?.name || null,
    email: decoded?.email || null,
    role: decoded?.role || "visitor",
  };

  if (!isDbEnabled()) return baseUser;

  try {
    await dbConnect();
    const user = await User.findById(userId).lean();

    if (!user) return null;

    return toSafeUser(user);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getAuthUser();

  if (!user) {
    return { ok: false, user: null, error: "Unauthorized" };
  }

  return { ok: true, user };
}

export async function requireAdmin() {
  const auth = await requireUser();

  if (!auth.ok) return auth;

  if (auth.user?.role !== "admin") {
    return { ok: false, user: auth.user, error: "Forbidden" };
  }

  return auth;
}

export async function requireApprovedWriter() {
  const auth = await requireUser();

  if (!auth.ok) return auth;
  if (auth.user?.role === "admin") return auth;

  if (
    auth.user?.role !== "blog_writer" ||
    auth.user?.writerVerification?.status !== "approved"
  ) {
    return {
      ok: false,
      user: auth.user,
      error: "Writer approval required",
    };
  }

  return auth;
}
