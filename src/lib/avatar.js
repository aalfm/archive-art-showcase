export function normalizeUserRole(role) {
  if (typeof role !== 'string') return '';
  return role.trim().toLowerCase();
}

export function canUseProfileImage(role) {
  return normalizeUserRole(role) === 'member';
}

export function normalizeAvatarUrl(src) {
  if (typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

export function getAvatarVariant(role) {
  const normalized = normalizeUserRole(role);
  if (normalized === 'admin') return 'admin';
  if (normalized === 'curator') return 'curator';
  return 'member';
}

export function getDefaultAvatarLabel(role) {
  const variant = getAvatarVariant(role);
  if (variant === 'admin') return 'Admin default avatar';
  if (variant === 'curator') return 'Curator default avatar';
  return 'Member default avatar';
}

export function resolveUserAvatarSrc(input) {
  if (!input || typeof input !== 'object') return null;
  const role = input.role ?? input.user_role ?? input.creator_role;
  if (!canUseProfileImage(role)) return null;

  const rawSrc = input.profile_image ?? input.src ?? input.image ?? input.user_image ?? input.creator_image;
  const cleanSrc = normalizeAvatarUrl(rawSrc);
  return cleanSrc || null;
}

export function applyAvatarPolicy(user) {
  if (!user || typeof user !== 'object') return user;
  return {
    ...user,
    profile_image: resolveUserAvatarSrc(user),
  };
}
