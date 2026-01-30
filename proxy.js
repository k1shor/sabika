import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};

export default function proxy() {
  return NextResponse.next();
}
