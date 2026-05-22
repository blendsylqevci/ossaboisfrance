const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== Cristal (ID 27) houses ===");
  const cristalRes = await client.query("SELECT * FROM houses WHERE id = 27");
  console.log(JSON.stringify(cristalRes.rows[0], null, 2));

  console.log("\n=== Cristal (ID 27) houses_locales ===");
  const cristalLocRes = await client.query("SELECT * FROM houses_locales WHERE _parent_id = 27");
  console.log(JSON.stringify(cristalLocRes.rows, null, 2));

  await client.end();
}

main().catch(console.error);
