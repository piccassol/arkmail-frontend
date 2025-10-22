import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/(.*)',  // Protect all routes in ArkMail
]);

// Define public routes that don't need authentication
const isPublicRoute = createRouteMatcher([
  '/api/webhook(.*)',  // Webhooks if you have any
]);

export default clerkMiddleware((auth, request) => {
  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  if (isProtectedRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};