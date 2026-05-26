const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== houses planimetry check ===");
  const res = await client.query(`
    SELECT h.id, h.title, h.slug, h.planimetry_id, m.url AS planimetry_url
    FROM houses h
    LEFT JOIN media m ON h.planimetry_id = m.id
    ORDER BY h.id ASC
  `);
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
