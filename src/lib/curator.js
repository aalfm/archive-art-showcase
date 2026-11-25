/**
 * Shared validation rules and editorial copy for ARCHIVE Curator
 * registration, review, rejection reasons, and reapplication workflows.
 */

export const CURATOR_REQUIREMENTS_TITLE = 'Required Curator Application Materials';

export const CURATOR_REQUIREMENTS_BODY =
  'To apply as an ARCHIVE Curator, you must submit both a valid Portfolio link and your Curriculum Vitae (CV) via file upload or link so Admins can review your curatorial credentials.';

export const CURATOR_REQUIREMENTS_NOTE =
  'Portfolio links may point to your personal website, Behance, ArtStation, or institutional profile. For your CV, upload a PDF, DOC, or DOCX file (up to 5 MB) or provide a valid CV link.';

export const PORTFOLIO_RECOMMENDATION_TITLE = CURATOR_REQUIREMENTS_TITLE;
export const PORTFOLIO_RECOMMENDATION_BODY = CURATOR_REQUIREMENTS_BODY;
export const PORTFOLIO_RECOMMENDATION_NOTE = CURATOR_REQUIREMENTS_NOTE;

export const REJECTION_REASON_EXAMPLES = [
  'Portofolio belum menunjukkan pengalaman yang relevan dengan bidang arsitektur.',
  'CV belum mencantumkan rekam jejak atau pengalaman kuratorial yang memadai.',
  'Kualitas atau relevansi karya belum memenuhi kriteria kurator ARCHIVE.',
];

export const MAX_PORTFOLIO_URL_LENGTH = 500;
export const MAX_CV_URL_LENGTH = 500;
export const MAX_BACKGROUND_LENGTH = 1500;
export const MAX_SUPPORTING_NOTES_LENGTH = 1500;
export const MAX_REJECTION_REASON_LENGTH = 1000;

export const MAX_CV_FILE_SIZE_MB = 5;
export const MAX_CV_FILE_SIZE_BYTES = MAX_CV_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
export const ALLOWED_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const CV_FILE_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function validateHttpUrl(raw, { required = false, fieldLabel = 'URL', maxLength = 500, example = 'https://behance.net/username' } = {}) {
  if (raw === null || raw === undefined) {
    if (required) {
      return { valid: false, error: `${fieldLabel} is required.` };
    }
    return { valid: true, value: null };
  }

  const trimmed = String(raw).trim();
  if (!trimmed) {
    if (required) {
      return { valid: false, error: `${fieldLabel} is required.` };
    }
    return { valid: true, value: null };
  }

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `${fieldLabel} must be at most ${maxLength} characters.`,
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      valid: false,
      error: `${fieldLabel} cannot contain spaces. Use a valid link such as ${example}.`,
    };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: `Please enter a valid ${fieldLabel.toLowerCase()} starting with https:// or http:// (e.g. ${example}).`,
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      valid: false,
      error: `${fieldLabel} must start with https:// or http://.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const domainParts = hostname.split('.').filter(Boolean);
  const tld = domainParts[domainParts.length - 1] || '';

  if (domainParts.length < 2 || !/^[a-z]{2,24}$/i.test(tld)) {
    return {
      valid: false,
      error: `Please enter a complete website domain for your ${fieldLabel.toLowerCase()} (e.g. ${example}).`,
    };
  }

  return { valid: true, value: parsed.toString() };
}

/**
 * Validates a Curator portfolio URL.
 * Mandatory by default for Curator applications (`required: true`).
 */
export function validatePortfolioUrl(raw, options = {}) {
  const { required = true } = options;
  return validateHttpUrl(raw, {
    required,
    fieldLabel: 'Portfolio link',
    maxLength: MAX_PORTFOLIO_URL_LENGTH,
    example: 'https://behance.net/username',
  });
}

/**
 * Validates an optional CV URL (optional individually because CV can be
 * provided via file upload instead; format is strictly validated when provided).
 */
export function validateCvUrl(raw) {
  return validateHttpUrl(raw, {
    required: false,
    fieldLabel: 'CV link',
    maxLength: MAX_CV_URL_LENGTH,
    example: 'https://drive.google.com/file/d/...',
  });
}

/**
 * Extracts a normalized lowercase file extension including leading dot.
 */
export function getFileExtension(filename) {
  if (typeof filename !== 'string') return '';
  const trimmed = filename.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === trimmed.length - 1) return '';
  return trimmed.slice(lastDot).toLowerCase();
}

/**
 * Validates CV file metadata on both client and server before upload/storage.
 */
export function validateCvFileMeta(file) {
  if (!file || typeof file === 'string') {
    return { valid: false, error: 'Invalid CV file selected.' };
  }

  const name = typeof file.name === 'string' ? file.name.trim() : '';
  const ext = getFileExtension(name);
  if (!ALLOWED_CV_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: 'Unsupported CV file format. Please upload a PDF, DOC, or DOCX document.',
    };
  }

  const mime = typeof file.type === 'string' ? file.type.trim().toLowerCase() : '';
  if (mime && mime !== 'application/octet-stream' && !ALLOWED_CV_MIME_TYPES.includes(mime)) {
    return {
      valid: false,
      error: 'Unsupported CV file type. Please upload a valid PDF, DOC, or DOCX document.',
    };
  }

  const size = Number(file.size || 0);
  if (size <= 0) {
    return {
      valid: false,
      error: 'The selected CV file is empty. Please choose a valid document.',
    };
  }

  if (size > MAX_CV_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `CV file is too large. Maximum allowed size is ${MAX_CV_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true, ext, name, size };
}

/**
 * Validates that at least one CV submission method (uploaded/retained CV file OR
 * valid CV link) has been provided for a Curator application.
 */
export function validateCuratorCvRequirement({ hasCvFile = false, cvUrl = '' }) {
  const urlCheck = validateCvUrl(cvUrl);
  if (!urlCheck.valid) {
    return { valid: false, error: urlCheck.error, cvUrl: null };
  }

  if (!hasCvFile && !urlCheck.value) {
    return {
      valid: false,
      error: 'CV is required. Please upload a CV document (PDF, DOC, or DOCX) or provide a valid CV link.',
      cvUrl: null,
    };
  }

  return { valid: true, error: '', cvUrl: urlCheck.value };
}

/**
 * Format file sizes cleanly for upload feedback badges.
 */
export function formatFileSize(bytes) {
  const num = Number(bytes || 0);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
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
