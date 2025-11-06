import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withClerkMiddleware(async (req: NextRequest) => {
  const { userId, sessionId } = getAuth(req);

  // If not signed in, redirect to Clerk sign-in
  if (!userId || !sessionId) {
    const signInUrl = new URL('https://accounts.arktechnologies.ai/sign-in');
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Proxy API and static files as-is
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api') || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  // Forward user ID for internal API checks
  const res = NextResponse.next();
  res.headers.set('x-user-id', userId);
  return res;
});

// Prevent middleware from running on static assets
export const config = {
  matcher: ['/((?!_next|favicon.ico|public|static).*)'],
};
