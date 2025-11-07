import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicAssets = createRouteMatcher([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/(.*)",
  "/public/(.*)",
  "/static/(.*)",
  "/(.*)\\.(png|jpg|jpeg|svg|webp|ico|css|js|map|txt)$",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const h = req.nextUrl.hostname.toLowerCase();
  const p = req.nextUrl.pathname;

  if (publicAssets(req)) return NextResponse.next();

  const isMain = h === "arktechnologies.ai" || h === "www.arktechnologies.ai";
  const isAgents = h.startsWith("agents.");
  const isMail = h.startsWith("mail.");

  if (isMain) {
    const isPlayground = p === "/playground" || p.startsWith("/playground/");
    const isWaitlistPublic = p === "/playground/waitlist" || p.startsWith("/playground/waitlist/") || p === "/api/waitlist";
    if (!isPlayground || isWaitlistPublic) return NextResponse.next();
    await auth.protect();
    return NextResponse.next();
  }

  if (isAgents || isMail) {
    await auth.protect();
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
