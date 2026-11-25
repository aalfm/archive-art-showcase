import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getFileExtension, validateCvFileMeta } from './curator.js';

const CURATOR_CV_STORAGE_DIR = path.join(process.cwd(), 'storage', 'curator-cvs');

const EXT_TO_MIME = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function matchesCvMagicBytes(buffer, ext) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

  if (ext === '.pdf') {
    // %PDF-
    return (
      buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    );
  }

  if (ext === '.doc') {
    // OLE2 Compound Document signature: D0 CF 11 E0 A1 B1 1A E1
    return (
      buffer.length >= 8 &&
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1
    );
  }

  if (ext === '.docx') {
    // ZIP container signature: PK\x03\x04
    return (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    );
  }

  return false;
}

function sanitizeDisplayFilename(rawName, fallbackExt) {
  const base = path.basename(String(rawName || '').trim())
    .replace(/[\x00-\x1f\x7f"\\/<>:|?*]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  if (!base) return `curator-cv${fallbackExt}`;
  return base.slice(0, 200);
}

/**
 * Checks whether a FormData value is a non-empty uploaded File.
 */
export function hasUploadedCvFile(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof value.arrayBuffer === 'function' &&
      typeof value.name === 'string' &&
      value.name.trim().length > 0 &&
      Number(value.size || 0) > 0
  );
}

/**
 * Validates CV file metadata and binary signature without writing to disk yet.
 */
export async function prepareCuratorCvUpload(file) {
  const metaCheck = validateCvFileMeta(file);
  if (!metaCheck.valid) {
    return { valid: false, error: metaCheck.error };
  }

  let buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch {
    return { valid: false, error: 'Failed to read the uploaded CV file. Please try again.' };
  }

  if (buffer.length === 0) {
    return { valid: false, error: 'The uploaded CV file is empty.' };
  }

  if (!matchesCvMagicBytes(buffer, metaCheck.ext)) {
    return {
      valid: false,
      error: `The uploaded file does not appear to be a valid ${metaCheck.ext.slice(1).toUpperCase()} document. Please upload an authentic PDF, DOC, or DOCX file.`,
    };
  }

  const displayName = sanitizeDisplayFilename(metaCheck.name, metaCheck.ext);
  const storedFilename = `${uuidv4()}${metaCheck.ext}`;

  return {
    valid: true,
    buffer,
    ext: metaCheck.ext,
    displayName,
    storedFilename,
  };
}

/**
 * Persists a previously validated CV upload into private storage outside `public/`.
 */
export async function savePreparedCuratorCv(prepared) {
  await mkdir(CURATOR_CV_STORAGE_DIR, { recursive: true });
  const targetPath = getStoredCuratorCvPath(prepared.storedFilename);
  if (!targetPath) {
    throw new Error('Invalid CV storage filename.');
  }
  await writeFile(targetPath, prepared.buffer);
  return {
    cvFilePath: prepared.storedFilename,
    cvFileName: prepared.displayName,
  };
}

/**
 * Safely deletes a stored CV file (used for rollback cleanup if DB insert fails).
 */
export async function removeStoredCuratorCv(storedFilename) {
  const targetPath = getStoredCuratorCvPath(storedFilename);
  if (!targetPath) return;
  try {
    await unlink(targetPath);
  } catch {
    // Ignore missing file on rollback cleanup
  }
}

/**
 * Resolves a stored CV filename strictly within `storage/curator-cvs/`.
 * Rejects any path traversal attempts.
 */
export function getStoredCuratorCvPath(storedFilename) {
  if (typeof storedFilename !== 'string') return null;
  const trimmed = storedFilename.trim();
  if (!trimmed) return null;

  const base = path.basename(trimmed);
  if (base !== trimmed || base.includes('..') || base.includes('/') || base.includes('\\')) {
    return null;
  }

  const ext = getFileExtension(base);
  if (!EXT_TO_MIME[ext]) return null;

  const resolvedDir = path.resolve(CURATOR_CV_STORAGE_DIR);
  const resolvedTarget = path.resolve(CURATOR_CV_STORAGE_DIR, base);
  if (!resolvedTarget.startsWith(resolvedDir + path.sep)) {
    return null;
  }

  return resolvedTarget;
}

export function getCuratorCvMimeType(filename) {
  const ext = getFileExtension(filename);
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}
