import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pg = require('pg');

export const ROOT_DIR = process.cwd();
export const SCHEMA_PATH = path.join(ROOT_DIR, 'database', 'schema.sql');
export const SEED_PATH = path.join(ROOT_DIR, 'database', 'seed.sql');

export const ARCHIVE_TABLES = [
  'sessions',
  'submissions',
  'reports',
  'comments',
  'favorites',
  'artwork_likes',
  'curator_applications',
  'challenges',
  'artworks',
  'categories',
  'users',
];

const ALLOWED_LOCAL_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '[::1]',
  'host.docker.internal',
  'postgres',
  'db',
]);

const FORBIDDEN_DB_NAME_PATTERN = /(^|[_-])(prod|production|live|staging)([_-]|$)/i;

/**
 * Loads environment variables from `.env.local` and `.env` without modifying files
 * and without overriding variables already present in `process.env`.
 */
export function loadLocalEnv() {
  for (const filename of ['.env.local', '.env']) {
    const filePath = path.join(ROOT_DIR, filename);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex <= 0) continue;

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = value;
      }
    }
  }
}

/**
 * Parses and validates DATABASE_URL without ever exposing credentials in logs or errors.
 */
export function getDatabaseConfig({ requireSafeResetTarget = false } = {}) {
  loadLocalEnv();

  const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
  if (requireSafeResetTarget) {
    if (nodeEnv && nodeEnv !== 'development' && nodeEnv !== 'test') {
      throw new Error(
        `Refusing database reset: NODE_ENV="${process.env.NODE_ENV}" is not allowed. Only development or test environments may be reset.`
      );
    }

    const prodIndicators = [
      ['VERCEL_ENV', process.env.VERCEL_ENV],
      ['RAILWAY_ENVIRONMENT', process.env.RAILWAY_ENVIRONMENT],
      ['RENDER', process.env.RENDER],
      ['FLY_APP_NAME', process.env.FLY_APP_NAME],
    ];
    for (const [key, val] of prodIndicators) {
      if (val && String(val).trim().toLowerCase() !== 'development' && String(val).trim().toLowerCase() !== 'test') {
        throw new Error(
          `Refusing database reset: deployment environment indicator "${key}" is active.`
        );
      }
    }
  }

  const rawUrl = (process.env.DATABASE_URL || '').trim();
  if (!rawUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Copy .env.example to .env.local and set your local PostgreSQL connection string.'
    );
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('DATABASE_URL is invalid. Check your .env.local configuration.');
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new Error('DATABASE_URL must use the postgresql:// or postgres:// protocol.');
  }

  const hostname = (parsed.hostname || '').trim().toLowerCase();
  const port = parsed.port || '5432';
  const dbName = parsed.pathname.replace(/^\/+/, '').trim();

  if (!hostname || !dbName) {
    throw new Error('DATABASE_URL must specify both a host and a database name.');
  }

  if (requireSafeResetTarget) {
    if (!ALLOWED_LOCAL_HOSTS.has(hostname)) {
      throw new Error(
        `Refusing database reset: host "${hostname}" is not an allowed local development/test database host.`
      );
    }
    if (FORBIDDEN_DB_NAME_PATTERN.test(dbName)) {
      throw new Error(
        `Refusing database reset: database name "${dbName}" appears to be a protected production/staging database.`
      );
    }
  }

  return {
    connectionString: rawUrl,
    safeTarget: {
      hostname,
      port,
      dbName,
      environment: nodeEnv || 'development',
    },
  };
}

export function createPool(connectionString) {
  return new pg.Pool({
    connectionString,
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
}

export function formatSafeDbError(err) {
  if (!err) return 'Unknown database error.';
  if (err.code === 'ECONNREFUSED') {
    return 'Unable to connect to PostgreSQL (connection refused). Ensure PostgreSQL is running.';
  }
  if (err.code === '3D000') {
    return 'Target PostgreSQL database does not exist yet. Create it first (e.g. CREATE DATABASE archive_db;).';
  }
  if (err.code === '28P01' || err.code === '28000') {
    return 'PostgreSQL authentication failed. Verify your credentials in .env.local.';
  }
  const msg = String(err.message || 'Database error');
  return msg.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgresql://[REDACTED]');
}

export async function collectTableCounts(client) {
  const existingRes = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  );
  const existingSet = new Set(existingRes.rows.map((r) => r.tablename));

  const counts = {};
  for (const table of [...ARCHIVE_TABLES].reverse()) {
    if (!existingSet.has(table)) {
      counts[table] = null;
      continue;
    }
    const res = await client.query(`SELECT COUNT(*)::int AS cnt FROM "${table}"`);
    counts[table] = res.rows[0].cnt;
  }
  return { counts, existingSet };
}

export function printCountComparison(beforeCounts, afterCounts) {
  const rows = [...ARCHIVE_TABLES].reverse().map((table) => ({
    table,
    before: beforeCounts[table] === null ? '(missing)' : beforeCounts[table],
    after: afterCounts[table] === null ? '(missing)' : afterCounts[table],
  }));
  console.table(rows);
}
