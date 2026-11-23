import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'arthive-fallback-secret-key-32chars'
);

const COOKIE_NAME = 'arthive_session';

/**
 * Optimistic route guard (Next.js 16 "proxy" convention).
 * Only verifies the signed session cookie here; the authoritative
 * role / curator-status checks run server-side in requireRole()
 * because they need a database lookup.
 */
export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let valid = false;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      valid = Boolean(payload.sessionId);
    } catch {
      valid = false;
    }
  }

  // Protected dashboard area
  if (pathname.startsWith('/dashboard')) {
    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + search);
      const res = NextResponse.redirect(loginUrl);
      if (token) res.cookies.delete(COOKIE_NAME);
      return res;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
