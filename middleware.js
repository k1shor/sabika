import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyTokenEdge(token) {
  try {
    if (!process.env.JWT_SECRET) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const decodedToken = token ? await verifyTokenEdge(token) : null;

  const url = req.nextUrl.clone();
  const path = url.pathname;

  const isAuthRoute =
    path === "/login" ||
    path === "/register" ||
    path === "/forgot-password" ||
    path === "/reset-password";

  const isAdminRoute = path.startsWith("/admin");
  const isWriterRoute = path.startsWith("/writers");

  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/following") ||
    path.startsWith("/saved") ||
    path.startsWith("/notifications") ||
    isAdminRoute ||
    isWriterRoute;

  // ✅ Authenticated users shouldn't access login/register pages
  if (decodedToken && isAuthRoute) {
    url.pathname = decodedToken.role === "admin" ? "/admin/dashboard" : "/dashboard/profile";
    return NextResponse.redirect(url);
  }

  // ✅ Unauthenticated users must login first
  if (!decodedToken && isProtectedRoute) {
    url.pathname = "/login";
    url.searchParams.set("next", path);

    const response = NextResponse.redirect(url);

    // Remove invalid/expired cookie if it exists
    if (token) {
      response.cookies.delete("token");
    }

    return response;
  }

  // ✅ Admin-only routes
  if (decodedToken && isAdminRoute) {
    if (decodedToken.role !== "admin") {
      url.pathname = "/dashboard/profile";
      return NextResponse.redirect(url);
    }
  }

  // ✅ Redirect admins from simple /dashboard or /dashboard/overview to /admin/dashboard
  if (
    decodedToken &&
    decodedToken.role === "admin" &&
    (path === "/dashboard" || path === "/dashboard/overview")
  ) {
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  // ✅ Writer-only routes (admins allowed)
  if (decodedToken && isWriterRoute) {
    if (
      decodedToken.role !== "blog_writer" &&
      decodedToken.role !== "admin"
    ) {
      url.pathname = "/dashboard/profile";
      return NextResponse.redirect(url);
    }
  }

  // ✅ Redirect admins from writer posts to admin posts
  if (
    decodedToken &&
    decodedToken.role === "admin" &&
    path === "/writers/posts"
  ) {
    url.pathname = "/admin/dashboard/posts";
    url.search = "?tab=official";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/following/:path*",
    "/saved/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/writers/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
