import fs from 'node:fs';
import {
  SCHEMA_PATH,
  SEED_PATH,
  collectTableCounts,
  createPool,
  formatSafeDbError,
  getDatabaseConfig,
  printCountComparison,
} from './db-utils.mjs';

async function main() {
  const config = getDatabaseConfig({ requireSafeResetTarget: false });
  const { safeTarget } = config;
  console.log(
    `[db:seed] Connecting to database "${safeTarget.dbName}" on ${safeTarget.hostname}:${safeTarget.port} (env: ${safeTarget.environment})...`
  );

  if (!fs.existsSync(SCHEMA_PATH) || !fs.existsSync(SEED_PATH)) {
    throw new Error('Required src/database/schema.sql or src/database/seed.sql file is missing.');
  }

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const seedSql = fs.readFileSync(SEED_PATH, 'utf8');

  const pool = createPool(config.connectionString);
  const client = await pool.connect();

  try {
    const { counts: beforeCounts, existingSet } = await collectTableCounts(client);

    await client.query('BEGIN');
    if (existingSet.size < 11) {
      console.log('[db:seed] Applying src/database/schema.sql to initialize missing tables...');
      await client.query(schemaSql);
    }
    console.log('[db:seed] Executing official src/database/seed.sql...');
    await client.query(seedSql);
    await client.query('COMMIT');

    const { counts: afterCounts } = await collectTableCounts(client);
    console.log('[db:seed] Seed completed successfully. Table row counts:');
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
  console.error('[db:seed] Error:', formatSafeDbError(err));
  process.exit(1);
});
