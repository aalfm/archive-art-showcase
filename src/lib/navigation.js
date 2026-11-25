/**
 * Maps active Next.js route pathnames to clean, human-readable sentence-case
 * page labels for the top navbar context indicator.
 */

const EXACT_ROUTE_LABELS = {
  '/': 'Home',
  '/explore': 'Explore',
  '/challenges': 'Challenges',
  '/artists': 'Artists',
  '/login': 'Sign In',
  '/register': 'Register',
  '/dashboard': 'Dashboard',
  '/dashboard/member': 'Dashboard',
  '/dashboard/member/profile': 'Profile',
  '/dashboard/member/artworks': 'My Artworks',
  '/dashboard/member/artworks/create': 'Upload',
  '/dashboard/member/favorites': 'Favorites',
  '/dashboard/member/submissions': 'Submissions',
  '/dashboard/member/settings': 'Settings',
  '/dashboard/member/inactive': 'Account Status',
  '/dashboard/curator': 'Dashboard',
  '/dashboard/curator/challenges': 'Challenges',
  '/dashboard/curator/challenges/create': 'Create Challenge',
  '/dashboard/curator/pending': 'Verification Status',
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/users': 'User Management',
  '/dashboard/admin/curators': 'Curator Verification',
  '/dashboard/admin/challenges': 'Challenges',
  '/dashboard/admin/categories': 'Categories',
  '/dashboard/admin/reports': 'Content Moderation',
};

const PATTERN_ROUTE_LABELS = [
  { pattern: /^\/artworks\/[^/]+$/, label: 'Artwork Details' },
  { pattern: /^\/challenges\/[^/]+$/, label: 'Challenge Details' },
  { pattern: /^\/artists\/[^/]+$/, label: 'Artist Profile' },
  { pattern: /^\/dashboard\/member\/artworks\/[^/]+\/edit$/, label: 'Edit Artwork' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+\/edit$/, label: 'Edit Challenge' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+\/submissions$/, label: 'Submissions' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+$/, label: 'Challenge Details' },
  { pattern: /^\/dashboard\/admin\/curators\/[^/]+$/, label: 'Curator Application' },
  { pattern: /^\/dashboard\/admin\/challenges\/[^/]+$/, label: 'Challenge Details' },
  { pattern: /^\/dashboard\/admin\/reports\/[^/]+$/, label: 'Report Details' },
  { pattern: /^\/dashboard\/admin\/users\/[^/]+$/, label: 'Member Details' },
  { pattern: /^\/dashboard\/admin\/artworks\/[^/]+$/, label: 'Artwork Details' },
];

const MEMBER_DROPDOWN_PAGE_LABELS = {
  '/dashboard/member': 'Overview',
  '/dashboard/member/profile': 'My Profile',
  '/dashboard/member/artworks': 'My Artworks',
  '/dashboard/member/artworks/create': 'My Artworks',
  '/dashboard/member/favorites': 'Favorites',
  '/dashboard/member/submissions': 'Submissions',
};

const MEMBER_DROPDOWN_PATTERN_LABELS = [
  { pattern: /^\/dashboard\/member\/artworks\/[^/]+\/edit$/, label: 'My Artworks' },
];

const CURATOR_DROPDOWN_PAGE_LABELS = {
  '/dashboard/curator': 'Overview',
  '/dashboard/curator/challenges': 'My Challenges',
  '/dashboard/curator/challenges/create': 'My Challenges',
  '/dashboard/curator/pending': 'Verification Status',
};

const CURATOR_DROPDOWN_PATTERN_LABELS = [
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+(?:\/(?:edit|submissions))?$/, label: 'My Challenges' },
];

function normalizePathname(pathname) {
  if (typeof pathname !== 'string') return '';
  const withoutQuery = pathname.split(/[?#]/)[0].trim();
  if (!withoutQuery) return '';
  if (withoutQuery === '/') return '/';
  return withoutQuery.replace(/\/+$/, '');
}

function formatSegmentFallback(segment) {
  const words = segment
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  const sentence = words.join(' ').toLowerCase();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Resolve a friendly sentence-case active page name from the current route pathname.
 * Returns an empty string if pathname is unavailable.
 */
export function getActivePageLabel(pathname) {
  const normalized = normalizePathname(pathname);
  if (!normalized) return '';

  if (Object.prototype.hasOwnProperty.call(EXACT_ROUTE_LABELS, normalized)) {
    return EXACT_ROUTE_LABELS[normalized];
  }

  for (const entry of PATTERN_ROUTE_LABELS) {
    if (entry.pattern.test(normalized)) {
      return entry.label;
    }
  }

  // Fallback for any nested/unmapped route: pick the most meaningful non-numeric segment
  const segments = normalized.split('/').filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const seg = segments[i];
    if (!/^\d+$/.test(seg) && seg !== 'dashboard' && seg !== 'member' && seg !== 'curator' && seg !== 'admin') {
      return formatSegmentFallback(seg);
    }
  }

  return segments[0] === 'dashboard' ? 'Dashboard' : '';
}

/**
 * Resolve the active page indicator shown beside the Member role in the navbar.
 * Returns an empty string for main navigation pages (Home, Explore, Challenges,
 * Artists, and their public detail routes) so the indicator only appears on
 * Member profile dropdown pages.
 */
export function getMemberActivePageLabel(pathname) {
  const normalized = normalizePathname(pathname);
  if (!normalized) return '';

  if (Object.prototype.hasOwnProperty.call(MEMBER_DROPDOWN_PAGE_LABELS, normalized)) {
    return MEMBER_DROPDOWN_PAGE_LABELS[normalized];
  }

  for (const entry of MEMBER_DROPDOWN_PATTERN_LABELS) {
    if (entry.pattern.test(normalized)) {
      return entry.label;
    }
  }

  return '';
}

/**
 * Resolve the active page indicator shown beside the Curator role in the navbar.
 * Mirrors Member behavior: returns an empty string on public browsing routes
 * (Home, Explore, Challenges, Artists, and detail pages) and displays the
 * active Curator Dashboard section (`Overview`, `My Challenges`, or
 * `Verification status`) when inside the Curator Dashboard.
 */
export function getCuratorActivePageLabel(pathname) {
  const normalized = normalizePathname(pathname);
  if (!normalized) return '';

  if (Object.prototype.hasOwnProperty.call(CURATOR_DROPDOWN_PAGE_LABELS, normalized)) {
    return CURATOR_DROPDOWN_PAGE_LABELS[normalized];
  }

  for (const entry of CURATOR_DROPDOWN_PATTERN_LABELS) {
    if (entry.pattern.test(normalized)) {
      return entry.label;
    }
  }

  return '';
}
