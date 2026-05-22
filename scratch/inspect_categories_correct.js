const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== house_categories ===");
  const res = await client.query("SELECT * FROM house_categories");
  console.log(JSON.stringify(res.rows, null, 2));

  console.log("=== house_categories_locales ===");
  const resLoc = await client.query("SELECT * FROM house_categories_locales");
  console.log(JSON.stringify(resLoc.rows, null, 2));

  await client.end();
}

main().catch(console.error);
