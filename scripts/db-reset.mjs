import fs from 'node:fs';
import {
  ARCHIVE_TABLES,
  SCHEMA_PATH,
  SEED_PATH,
  collectTableCounts,
  createPool,
  formatSafeDbError,
  getDatabaseConfig,
  printCountComparison,
} from './db-utils.mjs';

const EXPECTED_SEED_COUNTS = {
  users: 11,
  categories: 10,
  artworks: 19,
  challenges: 6,
  submissions: 13,
  curator_applications: 4,
  comments: 8,
  reports: 4,
  favorites: 8,
  sessions: 0,
};

async function main() {
  const config = getDatabaseConfig({ requireSafeResetTarget: true });
  const { safeTarget } = config;
  console.log(
    `[db:reset] Verified safe target "${safeTarget.dbName}" on ${safeTarget.hostname}:${safeTarget.port} (env: ${safeTarget.environment}).`
  );

  if (!fs.existsSync(SCHEMA_PATH) || !fs.existsSync(SEED_PATH)) {
    throw new Error('Required src/database/schema.sql or src/database/seed.sql file is missing.');
  }

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const seedSql = fs.readFileSync(SEED_PATH, 'utf8');

  const pool = createPool(config.connectionString);
  const client = await pool.connect();

  try {
    const { counts: beforeCounts } = await collectTableCounts(client);

    await client.query('BEGIN');

    console.log('[db:reset] Ensuring schema from src/database/schema.sql...');
    await client.query(schemaSql);

    console.log('[db:reset] Truncating all tables with RESTART IDENTITY CASCADE...');
    const tableList = ARCHIVE_TABLES.map((t) => `"${t}"`).join(', ');
    await client.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);

    console.log('[db:reset] Restoring official seed data from src/database/seed.sql...');
    await client.query(seedSql);

    await client.query('COMMIT');

    const { counts: afterCounts } = await collectTableCounts(client);
    for (const [table, expected] of Object.entries(EXPECTED_SEED_COUNTS)) {
      if (afterCounts[table] !== expected) {
        throw new Error(
          `Post-reset verification mismatch for "${table}": expected ${expected}, got ${afterCounts[table]}.`
        );
      }
    }
    if (!(afterCounts.artwork_likes > 0)) {
      throw new Error('Post-reset verification mismatch for "artwork_likes": expected > 0.');
    }

    console.log('[db:reset] Reset & seed completed. Before vs After table row counts:');
    printCountComparison(beforeCounts, afterCounts);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[db:reset] Error:', formatSafeDbError(err));
  process.exit(1);
});
