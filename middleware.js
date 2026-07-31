import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

async function verifyTokenEdge(token) {
  try {
    if (!process.env.JWT_SECRET) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
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

  // 1. Prevent authenticated users from accessing login/register pages
  if (token && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 2. Redirect unauthenticated users trying to access protected routes to login
  if (!token && isProtectedRoute) {
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // 3. Restrict admin routes to admin users only
  if (token && isAdminRoute) {
    if (decodedToken?.role !== "admin") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 4. Restrict writer routes to writers (and admins)
  // Note: The actual "approved" writer check is maintained in Mongoose
  // via requireApprovedWriter() since the DB status can change anytime.
  if (token && isWriterRoute) {
    if (decodedToken?.role !== "blog_writer" && decodedToken?.role !== "admin") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 5. Redirect admins away from writer "My Posts" to the admin panel
  if (token && decodedToken?.role === "admin" && path === "/writers/posts") {
    url.pathname = "/admin/posts";
    url.search = "?tab=official";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on paths that need protection
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
