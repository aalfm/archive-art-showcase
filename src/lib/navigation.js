/**
 * Maps active Next.js route pathnames to clean, human-readable sentence-case
 * page labels for the top navbar context indicator.
 */

const EXACT_ROUTE_LABELS = {
  '/': 'Home',
  '/explore': 'Explore',
  '/challenges': 'Challenges',
  '/artists': 'Artists',
  '/login': 'Sign in',
  '/register': 'Register',
  '/dashboard': 'Dashboard',
  '/dashboard/member': 'Dashboard',
  '/dashboard/member/profile': 'Profile',
  '/dashboard/member/artworks': 'My artworks',
  '/dashboard/member/artworks/create': 'Upload',
  '/dashboard/member/favorites': 'Favorites',
  '/dashboard/member/submissions': 'Submissions',
  '/dashboard/member/settings': 'Settings',
  '/dashboard/member/inactive': 'Account status',
  '/dashboard/curator': 'Dashboard',
  '/dashboard/curator/challenges': 'Challenges',
  '/dashboard/curator/challenges/create': 'Create challenge',
  '/dashboard/curator/pending': 'Verification status',
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/users': 'User management',
  '/dashboard/admin/curators': 'Curator verification',
  '/dashboard/admin/challenges': 'Challenges',
  '/dashboard/admin/categories': 'Categories',
  '/dashboard/admin/reports': 'Content moderation',
};

const PATTERN_ROUTE_LABELS = [
  { pattern: /^\/artworks\/[^/]+$/, label: 'Artwork detail' },
  { pattern: /^\/challenges\/[^/]+$/, label: 'Challenge detail' },
  { pattern: /^\/artists\/[^/]+$/, label: 'Artist profile' },
  { pattern: /^\/dashboard\/member\/artworks\/[^/]+\/edit$/, label: 'Edit artwork' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+\/edit$/, label: 'Edit challenge' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+\/submissions$/, label: 'Submissions' },
  { pattern: /^\/dashboard\/curator\/challenges\/[^/]+$/, label: 'Challenge detail' },
  { pattern: /^\/dashboard\/admin\/challenges\/[^/]+$/, label: 'Challenge detail' },
  { pattern: /^\/dashboard\/admin\/reports\/[^/]+$/, label: 'Report detail' },
  { pattern: /^\/dashboard\/admin\/users\/[^/]+$/, label: 'Member detail' },
  { pattern: /^\/dashboard\/admin\/artworks\/[^/]+$/, label: 'Artwork detail' },
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
