const { Client } = require('pg');

const connectionString = "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to database.');

  try {
    await client.query('BEGIN');
    console.log('Transaction started.');

    // 1. Add "title" column to "houses" table if it doesn't exist
    console.log('Adding title column to houses table...');
    await client.query('ALTER TABLE "houses" ADD COLUMN IF NOT EXISTS "title" text;');

    // 2. Copy titles from French locale as the master title
    console.log('Copying titles from French locale (fr)...');
    const resFr = await client.query(`
      UPDATE "houses" h
      SET "title" = hl."title"
      FROM "houses_locales" hl
      WHERE hl."_parent_id" = h."id" AND hl."_locale" = 'fr' AND hl."title" IS NOT NULL
    `);
    console.log(`Copied ${resFr.rowCount} titles from French locale.`);

    // 3. Fallback: Copy titles from any other available locale for houses that still don't have titles
    console.log('Copying fallback titles from other locales...');
    const resFallback = await client.query(`
      UPDATE "houses" h
      SET "title" = hl."title"
      FROM "houses_locales" hl
      WHERE hl."_parent_id" = h."id" AND h."title" IS NULL AND hl."title" IS NOT NULL
    `);
    console.log(`Copied ${resFallback.rowCount} fallback titles.`);

    // 4. Drop the localized title column from "houses_locales"
    console.log('Dropping title column from houses_locales table...');
    await client.query('ALTER TABLE "houses_locales" DROP COLUMN IF EXISTS "title";');

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', err);
    throw err;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main().catch(console.error);
