export function isValidId(value) {
  return typeof value === 'string' ? /^\d{1,9}$/.test(value) : Number.isInteger(value) && value > 0;
}

/** Parse a positive integer id from route params / form data; returns null if invalid. */
export function toId(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!/^\d{1,9}$/.test(str)) return null;
  const n = parseInt(str, 10);
  return n > 0 ? n : null;
}
