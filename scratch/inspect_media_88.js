const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== Media ID 88 ===");
  const res = await client.query("SELECT id, filename, url FROM media WHERE id = 88");
  console.log(JSON.stringify(res.rows, null, 2));

  console.log("=== Houses referencing 88 ===");
  const resHouses = await client.query("SELECT id, slug, default_image_id, final_image_id FROM houses WHERE default_image_id = 88 OR final_image_id = 88");
  console.log(JSON.stringify(resHouses.rows, null, 2));

  await client.end();
}

main().catch(console.error);
