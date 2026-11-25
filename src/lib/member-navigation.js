/**
 * Shared contextual navigation utilities for direct Member & Curator
 * dashboard-to-detail flows and source-aware Navbar active-state tracking.
 *
 * Allows authenticated Members and Curators to navigate directly from
 * role-specific dashboard pages to existing Artwork Detail, Challenge Detail,
 * or Artist Profile pages while preserving:
 *  - Accurate navigation source tracking (preventing false Explore/Challenges/Artists
 *    navbar highlights when arriving from a dashboard menu)
 *  - Contextual breadcrumbs and safe return links across page refreshes
 *  - Preserved query parameters (filters, search, pagination) where applicable
 */

const ROLE_DASHBOARD_ORIGINS = {
  overview: {
    key: 'overview',
    role: 'member',
    label: 'Overview',
    href: '/dashboard/member',
    dashboardHref: '/dashboard/member',
    dropdownHref: '/dashboard/member',
    backLabel: 'Back to Overview',
    isOverview: true,
    allowSubpaths: false,
  },
  profile: {
    key: 'profile',
    role: 'member',
    label: 'My Profile',
    href: '/dashboard/member/profile',
    dashboardHref: '/dashboard/member',
    dropdownHref: '/dashboard/member/profile',
    backLabel: 'Back to My Profile',
    isOverview: false,
    allowSubpaths: false,
  },
  artworks: {
    key: 'artworks',
    role: 'member',
    label: 'My Artworks',
    href: '/dashboard/member/artworks',
    dashboardHref: '/dashboard/member',
    dropdownHref: '/dashboard/member/artworks',
    backLabel: 'Back to My Artworks',
    isOverview: false,
    allowSubpaths: false,
  },
  favorites: {
    key: 'favorites',
    role: 'member',
    label: 'Favorites',
    href: '/dashboard/member/favorites',
    dashboardHref: '/dashboard/member',
    dropdownHref: '/dashboard/member/favorites',
    backLabel: 'Back to Favorites',
    isOverview: false,
    allowSubpaths: false,
  },
  submissions: {
    key: 'submissions',
    role: 'member',
    label: 'Submissions',
    href: '/dashboard/member/submissions',
    dashboardHref: '/dashboard/member',
    dropdownHref: '/dashboard/member/submissions',
    backLabel: 'Back to Submissions',
    isOverview: false,
    allowSubpaths: false,
  },
  'curator-overview': {
    key: 'curator-overview',
    role: 'curator',
    label: 'Overview',
    href: '/dashboard/curator',
    dashboardHref: '/dashboard/curator',
    dropdownHref: '/dashboard/curator',
    backLabel: 'Back to Overview',
    isOverview: true,
    allowSubpaths: false,
  },
  'curator-challenges': {
    key: 'curator-challenges',
    role: 'curator',
    label: 'My Challenges',
    href: '/dashboard/curator/challenges',
    dashboardHref: '/dashboard/curator',
    dropdownHref: '/dashboard/curator/challenges',
    backLabel: 'Back to My Challenges',
    isOverview: false,
    allowSubpaths: true,
  },
};

const DETAIL_ROUTE_PATTERN = /^\/(artworks|challenges|artists)\/[^/]+$/;

function getFirstParam(searchParams, key) {
  if (!searchParams || typeof searchParams !== 'object') return '';
  const raw = searchParams[key];
  if (Array.isArray(raw)) return typeof raw[0] === 'string' ? raw[0].trim() : '';
  return typeof raw === 'string' ? raw.trim() : '';
}

function serializeSearchParams(searchParams) {
  if (!searchParams || typeof searchParams !== 'object') return '';
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null && String(item).length > 0) {
          params.append(key, String(item));
        }
      }
    } else if (value != null && String(value).length > 0) {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

function isOriginAllowedForUser(origin, user) {
  if (!origin || !user) return false;
  if (origin.role === 'member') return user.role === 'member';
  if (origin.role === 'curator') {
    return user.role === 'curator' && user.curator_status === 'approved';
  }
  return false;
}

function sanitizeReturnTo(rawReturnTo, origin) {
  if (!rawReturnTo || typeof rawReturnTo !== 'string') return origin.href;
  const trimmed = rawReturnTo.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return origin.href;
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return origin.href;
    }
    const matchesPath = origin.allowSubpaths
      ? parsed.pathname === origin.href || parsed.pathname.startsWith(`${origin.href}/`)
      : parsed.pathname === origin.href;
    if (!matchesPath) {
      return origin.href;
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return origin.href;
  }
}

/**
 * Build a direct detail URL carrying role-dashboard origin context (and optional
 * returnTo path or originating page query parameters).
 *
 * @param {string} detailPath - Existing detail route such as `/artworks/5`
 * @param {keyof typeof ROLE_DASHBOARD_ORIGINS} originKey
 * @param {Record<string, string|string[]|undefined>|string|null} [searchParamsOrReturnPath]
 * @returns {string}
 */
export function buildRoleDetailHref(detailPath, originKey, searchParamsOrReturnPath = null) {
  const origin = ROLE_DASHBOARD_ORIGINS[originKey];
  if (!origin || typeof detailPath !== 'string' || !detailPath.startsWith('/')) {
    return detailPath;
  }

  const [pathname, existingQuery = ''] = detailPath.split('?');
  const params = new URLSearchParams(existingQuery);
  params.set('from', origin.key);

  if (typeof searchParamsOrReturnPath === 'string') {
    const trimmed = searchParamsOrReturnPath.trim();
    if (trimmed.startsWith('/')) {
      const safeReturn = sanitizeReturnTo(trimmed, origin);
      if (safeReturn !== origin.href) {
        params.set('returnTo', safeReturn);
      }
    } else {
      const cleanQuery = trimmed.replace(/^\?/, '');
      if (cleanQuery) {
        params.set('returnTo', `${origin.href}?${cleanQuery}`);
      }
    }
  } else {
    const returnQuery = serializeSearchParams(searchParamsOrReturnPath);
    if (returnQuery) {
      params.set('returnTo', `${origin.href}?${returnQuery}`);
    }
  }

  return `${pathname}?${params.toString()}`;
}

/**
 * Backwards-compatible alias for Member dashboard detail links.
 */
export function buildMemberDetailHref(detailPath, originKey, searchParams = null) {
  return buildRoleDetailHref(detailPath, originKey, searchParams);
}

/**
 * Resolve contextual breadcrumb and return navigation for an authenticated
 * Member or approved Curator arriving on a shared detail page from a
 * role-specific dashboard menu.
 *
 * Returns `null` for logged-out visitors, mismatched roles, or standard public
 * visits without a recognized role-dashboard origin parameter.
 *
 * @param {Record<string, string|string[]|undefined>|null|undefined} searchParams
 * @param {{ role?: string, curator_status?: string }|null|undefined} user
 */
export function resolveRoleReturnContext(searchParams, user) {
  const rawFrom = getFirstParam(searchParams, 'from');
  const origin = ROLE_DASHBOARD_ORIGINS[rawFrom];
  if (!isOriginAllowedForUser(origin, user)) return null;

  const rawReturnTo = getFirstParam(searchParams, 'returnTo');
  const returnHref = sanitizeReturnTo(rawReturnTo, origin);
  const returnPathname = returnHref.split('?')[0];
  const isCuratorSubmissionsReturn =
    origin.key === 'curator-challenges' &&
    /^\/dashboard\/curator\/challenges\/[^/]+\/submissions$/.test(returnPathname);

  const backLabel = isCuratorSubmissionsReturn ? 'Back to Submissions' : origin.backLabel;

  return {
    originKey: origin.key,
    role: origin.role,
    label: origin.label,
    dropdownHref: origin.dropdownHref,
    returnHref,
    backLabel,
    buildBreadcrumbs(currentLabel) {
      if (origin.isOverview) {
        return [
          { label: 'Home', href: '/' },
          { label: origin.label, href: returnHref },
          { label: currentLabel },
        ];
      }

      if (isCuratorSubmissionsReturn) {
        return [
          { label: 'Dashboard', href: origin.dashboardHref },
          { label: origin.label, href: origin.href },
          { label: 'Submissions', href: returnHref },
          { label: currentLabel },
        ];
      }

      return [
        { label: 'Dashboard', href: origin.dashboardHref },
        { label: origin.label, href: returnHref },
        { label: currentLabel },
      ];
    },
    appendContext(detailPath) {
      return buildRoleDetailHref(
        detailPath,
        origin.key,
        returnHref !== origin.href ? returnHref : null
      );
    },
  };
}

/**
 * Backwards-compatible alias for Member return context resolution.
 */
export function resolveMemberReturnContext(searchParams, user) {
  return resolveRoleReturnContext(searchParams, user);
}

/**
 * Determine whether the current shared detail page was opened from a
 * role-specific dashboard menu so Navbar can suppress public section
 * highlighting (Explore / Challenges / Artists) and preserve the active
 * role-menu indicator instead.
 *
 * @param {string} pathname
 * @param {string|null|undefined} fromParam
 * @param {{ role?: string, curator_status?: string }|null|undefined} user
 */
export function resolveNavbarDashboardOrigin(pathname, fromParam, user) {
  if (typeof pathname !== 'string' || !fromParam) return null;
  const normalizedPath = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  if (!DETAIL_ROUTE_PATTERN.test(normalizedPath)) return null;

  const origin = ROLE_DASHBOARD_ORIGINS[String(fromParam).trim()];
  if (!isOriginAllowedForUser(origin, user)) return null;

  return {
    key: origin.key,
    role: origin.role,
    label: origin.label,
    dropdownHref: origin.dropdownHref,
  };
}
