// middleware.ts
import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withClerkMiddleware(async (req: NextRequest) => {
  const { userId, sessionId } = getAuth(req);
  const url = req.nextUrl;
  const { pathname } = url;

  // Hosts we care about
  const host = req.headers.get('host') || '';
  const isMain =
    host === 'arktechnologies.ai' || host === 'www.arktechnologies.ai';
  const isAgents = host.startsWith('agents.');
  const isMail = host.startsWith('mail.');

  // Always let static & _next & file assets through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.map')
  ) {
    return NextResponse.next();
  }

  // Allow all API routes through (your API can still auth-check per handler)
  if (pathname.startsWith('/api')) {
    // but keep waitlist API explicitly public
    return NextResponse.next();
  }

  // PUBLIC ROUTES:
  // On the main app: the waitlist page is public
  const isPublicOnMain =
    isMain &&
    (pathname === '/playground/waitlist' ||
      pathname.startsWith('/playground/waitlist/'));
  if (isPublicOnMain) {
    return NextResponse.next();
  }

  // If user is not signed in, redirect to centralized Clerk sign-in
  if (!userId || !sessionId) {
    // After auth, land everyone on the single waitlist page (central funnel)
    const postAuthUrl = 'https://arktechnologies.ai/playground/waitlist';
    const signInUrl = new URL('https://accounts.arktechnologies.ai/sign-in');

    // Clerk accepts `redirect_url` as the destination after auth
    signInUrl.searchParams.set('redirect_url', postAuthUrl);

    return NextResponse.redirect(signInUrl);
  }

  // Forward user ID (optional header for your internal APIs)
  const res = NextResponse.next();
  res.headers.set('x-user-id', userId);
  return res;
});

// Run on everything except obvious static
export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
};
