const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== Houses Prices ===");
  const res = await client.query("SELECT id, slug, category_id, price60x160, price60x200 FROM houses ORDER BY category_id, id");
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
