/**
 * Shared Challenge Name normalization and duplicate-detection helpers.
 * Used identically by client forms, API routes, and Server Actions.
 */

export const DUPLICATE_CHALLENGE_NAME_ERROR =
  'This challenge name already exists. Please choose a different name.';

export function cleanChallengeTitle(title) {
  return typeof title === 'string' ? title.trim() : '';
}

export function normalizeChallengeName(title) {
  return cleanChallengeTitle(title).toLowerCase();
}

export function findDuplicateChallengeMatch(
  title,
  existingChallenges = [],
  excludeChallengeId = null
) {
  const normalizedTarget = normalizeChallengeName(title);
  if (!normalizedTarget || !Array.isArray(existingChallenges)) {
    return null;
  }

  const excludedId =
    excludeChallengeId !== null && excludeChallengeId !== undefined
      ? Number(excludeChallengeId)
      : null;

  return (
    existingChallenges.find((item) => {
      if (!item) return false;
      if (excludedId && Number(item.id) === excludedId) {
        return false;
      }
      const candidate =
        typeof item.normalizedTitle === 'string'
          ? item.normalizedTitle
          : typeof item.normalized_title === 'string'
            ? item.normalized_title
            : normalizeChallengeName(item.title);
      return candidate === normalizedTarget;
    }) || null
  );
}
