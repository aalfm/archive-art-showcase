/**
 * Shared validation rules and editorial copy for ARTHIVE Curator
 * registration, review, rejection reasons, and reapplication workflows.
 */

export const PORTFOLIO_RECOMMENDATION_TITLE = 'Recommended: Add Your Portfolio';

export const PORTFOLIO_RECOMMENDATION_BODY =
  'Menambahkan portofolio dapat membantu tim Admin meninjau pengalaman, kemampuan, dan kualitas karya Anda dengan lebih mudah sehingga proses verifikasi berpotensi berlangsung lebih cepat.';

export const PORTFOLIO_RECOMMENDATION_NOTE =
  'Portofolio bersifat opsional. Anda dapat menyertakan link website pribadi, Behance, ArtStation, Instagram profesional, atau platform portofolio lainnya. Menyertakan portofolio membantu peninjauan, namun bukan jaminan persetujuan.';

export const REJECTION_REASON_EXAMPLES = [
  'Portofolio belum menunjukkan pengalaman yang relevan dengan bidang arsitektur.',
  'Informasi profil dan pengalaman masih kurang lengkap.',
  'Kualitas atau relevansi karya belum memenuhi kriteria kurator ARTHIVE.',
];

export const MAX_PORTFOLIO_URL_LENGTH = 500;
export const MAX_BACKGROUND_LENGTH = 1500;
export const MAX_SUPPORTING_NOTES_LENGTH = 1500;
export const MAX_REJECTION_REASON_LENGTH = 1000;

/**
 * Validates an optional portfolio URL.
 * Allows empty values (returns value: null).
 * When provided, requires a valid http:// or https:// URL with a dot-separated domain.
 */
export function validatePortfolioUrl(raw) {
  if (raw === null || raw === undefined) {
    return { valid: true, value: null };
  }

  const trimmed = String(raw).trim();
  if (!trimmed) {
    return { valid: true, value: null };
  }

  if (trimmed.length > MAX_PORTFOLIO_URL_LENGTH) {
    return {
      valid: false,
      error: `Portfolio URL must be at most ${MAX_PORTFOLIO_URL_LENGTH} characters.`,
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      error: 'Portfolio URL cannot contain spaces. Use a valid link such as https://behance.net/username.',
    };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: 'Please enter a valid portfolio URL starting with https:// or http:// (e.g. https://behance.net/username).',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      error: 'Portfolio URL must start with https:// or http://.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const domainParts = hostname.split('.').filter(Boolean);
  const tld = domainParts[domainParts.length - 1] || '';

  if (domainParts.length < 2 || !/^[a-z]{2,24}$/i.test(tld)) {
    return {
      valid: false,
      error: 'Please enter a complete portfolio website domain (e.g. https://behance.net/username).',
    };
  }

  return { valid: true, value: parsed.toString() };
}

/**
 * Validates an Admin rejection reason.
 * Mandatory and must come from non-empty Admin input.
 */
export function validateRejectionReason(raw) {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (!trimmed) {
    return {
      valid: false,
      error: 'Rejection reason is required before rejecting this application.',
    };
  }

  if (trimmed.length < 5) {
    return {
      valid: false,
      error: 'Please provide a clear rejection reason (at least 5 characters).',
    };
  }

  if (trimmed.length > MAX_REJECTION_REASON_LENGTH) {
    return {
      valid: false,
      error: `Rejection reason must be at most ${MAX_REJECTION_REASON_LENGTH} characters.`,
    };
  }

  return { valid: true, value: trimmed };
}
