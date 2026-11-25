import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from './db';
import { applyAvatarPolicy } from './avatar';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'archive-fallback-secret-key-32chars'
);

const SESSION_DURATION_DAYS = 7;
const COOKIE_NAME = 'archive_session';

/**
 * Create a session for a user and set the cookie
 */
export async function createSession(userId) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  // Store session in DB
  await query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
    [sessionId, userId, expiresAt]
  );

  // Create JWT
  const token = await new SignJWT({ sessionId, userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .setIssuedAt()
    .sign(SECRET);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return sessionId;
}

/**
 * Get the current session and user from the cookie
 * @returns {Promise<{user: Object}|null>}
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    const { sessionId } = payload;

    const result = await query(
      `SELECT s.id as session_id, u.id, u.name, u.email, u.role, u.curator_status,
              u.is_active,
              CASE WHEN LOWER(u.role) = 'member' THEN u.profile_image ELSE NULL END as profile_image,
              u.bio, u.external_link, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1 AND s.expires_at > NOW() AND u.is_active = TRUE`,
      [sessionId]
    );

    if (result.rows.length === 0) return null;

    return { user: applyAvatarPolicy(result.rows[0]) };
  } catch {
    return null;
  }
}

/**
 * Revoke all active sessions for a specific user (e.g. on account deactivation)
 */
export async function revokeUserSessions(userId) {
  await query('DELETE FROM sessions WHERE user_id = $1', [userId]);
}

/**
 * Inspect whether the current signed session cookie belongs to a deactivated account.
 * Queries the database directly and NEVER grants authenticated session access.
 * @returns {Promise<Object|null>}
 */
export async function getInactiveSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    const userId = Number(payload?.userId);
    if (!Number.isInteger(userId) || userId <= 0) return null;

    const result = await query(
      `SELECT id, name, email, role, curator_status, is_active,
              CASE WHEN LOWER(role) = 'member' THEN profile_image ELSE NULL END as profile_image,
              created_at
       FROM users
       WHERE id = $1 AND is_active = FALSE`,
      [userId]
    );

    if (result.rows.length === 0) return null;
    return applyAvatarPolicy(result.rows[0]);
  } catch {
    return null;
  }
}

/**
 * Delete the current session (logout)
 */
export async function deleteSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      const { payload } = await jwtVerify(token, SECRET);
      await query('DELETE FROM sessions WHERE id = $1', [payload.sessionId]);
    }

    cookieStore.delete(COOKIE_NAME);
  } catch {
    // Even if JWT verification fails, still delete the cookie
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }
}

/**
 * Require authentication — returns user or throws redirect
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    const inactiveUser = await getInactiveSessionUser();
    const { redirect } = await import('next/navigation');
    if (inactiveUser) {
      redirect('/dashboard/member/inactive');
    }
    redirect('/login');
  }
  return session.user;
}

/**
 * Resolve the Curator's home dashboard path based on verification status.
 */
export function getCuratorDashboardPath(user) {
  return user?.curator_status === 'approved'
    ? '/dashboard/curator'
    : '/dashboard/curator/pending';
}

/**
 * Enforce Dashboard-only access on public-facing routes for Admin users.
 * Redirects authenticated Admin users to /dashboard/admin while allowing
 * Members, Curators (read-only browsing), and unauthenticated visitors to browse public pages.
 */
export async function restrictAdminFromPublic(session) {
  const activeSession = session === undefined ? await getSession() : session;
  if (activeSession?.user?.role === 'admin') {
    const { redirect } = await import('next/navigation');
    redirect('/dashboard/admin');
  }
  return activeSession;
}

/**
 * Require a specific role
 */
export async function requireRole(...roles) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    const { redirect } = await import('next/navigation');
    if (user.role === 'admin') {
      redirect('/dashboard/admin');
    }
    if (user.role === 'curator') {
      redirect(getCuratorDashboardPath(user));
    }
    redirect('/');
  }
  // Additional check for curator status
  if (user.role === 'curator' && roles.includes('curator')) {
    if (user.curator_status !== 'approved') {
      const { redirect } = await import('next/navigation');
      redirect('/dashboard/curator/pending');
    }
  }
  return user;
}
