/**
 * Server-side authorization helpers for challenge management and winner selection.
 *
 * Core security rule:
 * - Only authenticated, active, approved Curators may create, edit, or delete challenges,
 *   and only the owning Curator (`challenge.curator_id === user.id`) may modify a
 *   challenge or select/update/clear its winners.
 * - Administrators, Members, unapproved Curators, and unauthenticated callers are
 *   strictly denied from challenge mutation and winner selection actions.
 */

export function isApprovedCurator(user) {
  if (!user || typeof user !== 'object') return false;
  if (user.is_active === false) return false;
  return (
    String(user.role || '').trim().toLowerCase() === 'curator' &&
    String(user.curator_status || '').trim().toLowerCase() === 'approved'
  );
}

export function isChallengeOwnerCurator(user, challenge) {
  if (!isApprovedCurator(user) || !challenge || typeof challenge !== 'object') {
    return false;
  }
  const ownerId = Number(challenge.curator_id);
  const userId = Number(user.id);
  return Number.isInteger(ownerId) && ownerId > 0 && ownerId === userId;
}

export function authorizeCuratorChallengeActor(session, actionLabel = 'manage challenges') {
  if (!session?.user) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      error: 'Authentication required. Please sign in as a verified curator.',
    };
  }

  const user = session.user;
  if (user.is_active === false) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error: '403 Forbidden: Your account is inactive.',
    };
  }

  const role = String(user.role || '').trim().toLowerCase();
  if (role === 'admin') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error: `403 Forbidden: Administrators are not permitted to ${actionLabel}. Only verified curators can manage challenges.`,
    };
  }

  if (role !== 'curator') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error: `403 Forbidden: Only verified curators can ${actionLabel}.`,
    };
  }

  if (String(user.curator_status || '').trim().toLowerCase() !== 'approved') {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error: `403 Forbidden: Your curator account must be approved before you can ${actionLabel}.`,
    };
  }

  return { ok: true, status: 200, code: 'OK', user };
}

export function authorizeChallengeOwner(user, challenge, actionLabel = 'manage this challenge') {
  if (!user) {
    return {
      ok: false,
      status: 401,
      code: 'UNAUTHORIZED',
      error: 'Authentication required. Please sign in first.',
    };
  }

  if (!isApprovedCurator(user)) {
    const role = String(user.role || '').trim().toLowerCase();
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error:
        role === 'admin'
          ? `403 Forbidden: Administrators are not permitted to ${actionLabel}.`
          : `403 Forbidden: Only verified curators can ${actionLabel}.`,
    };
  }

  if (!challenge) {
    return {
      ok: false,
      status: 404,
      code: 'NOT_FOUND',
      error: 'Challenge not found.',
    };
  }

  if (!isChallengeOwnerCurator(user, challenge)) {
    return {
      ok: false,
      status: 403,
      code: 'FORBIDDEN',
      error: `403 Forbidden: You are not authorized to ${actionLabel}.`,
    };
  }

  return { ok: true, status: 200, code: 'OK', user };
}
