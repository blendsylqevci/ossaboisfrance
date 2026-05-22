const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== Dianne house ===");
  const res = await client.query("SELECT * FROM houses WHERE slug = 'dianne'");
  console.log(JSON.stringify(res.rows, null, 2));

  console.log("\n=== Dianne houses_locales ===");
  const resLoc = await client.query("SELECT * FROM houses_locales WHERE _parent_id = (SELECT id FROM houses WHERE slug = 'dianne')");
  console.log(JSON.stringify(resLoc.rows, null, 2));

  await client.end();
}

main().catch(console.error);
