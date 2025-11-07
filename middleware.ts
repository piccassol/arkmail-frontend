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

const publicWaitlist = createRouteMatcher([
  "/playground/waitlist",
  "/api/waitlist",
]);

const authPages = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const host = req.nextUrl.hostname.toLowerCase();
  const path = req.nextUrl.pathname;

  if (publicAssets(req) || authPages(req)) return NextResponse.next();

  const isMain = host === "arktechnologies.ai" || host === "www.arktechnologies.ai";
  const isAgents = host.startsWith("agents.");
  const isMail = host.startsWith("mail.");

  if (isMain) {
    const isPlayground = path === "/playground" || path.startsWith("/playground/");
    if (publicWaitlist(req) || !isPlayground) return NextResponse.next();
    await auth.protect();
    return NextResponse.next();
  }

  if (isAgents || isMail) {
    const { userId } = await auth();
    if (!userId) {
      const to = new URL("https://accounts.arktechnologies.ai/sign-in");
      to.searchParams.set("redirect_url", "https://arktechnologies.ai/playground/waitlist");
      return NextResponse.redirect(to);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
