const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244$$$.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== House Australe ===");
  const houseRes = await client.query("SELECT * FROM houses WHERE slug = 'australe'");
  if (houseRes.rows.length === 0) {
    console.log("No house found with slug 'australe'");
    await client.end();
    return;
  }
  const house = houseRes.rows[0];
  console.log(JSON.stringify(house, null, 2));

  console.log("\n=== House Relational/Locales ===");
  const houseLocRes = await client.query("SELECT * FROM houses_locales WHERE _parent_id = $1", [house.id]);
  console.log(JSON.stringify(houseLocRes.rows, null, 2));

  // Let's get the media files linked
  console.log("\n=== Media linked to Australe ===");
  const mediaRes = await client.query("SELECT id, url, filename, \"media_type\", house_id FROM media WHERE house_id = $1", [house.id]);
  console.log(JSON.stringify(mediaRes.rows, null, 2));

  // Check specific column names for defaultImage and finalImage
  // Note: Payload uses relationships tables sometimes or direct columns like default_image_id
  const relsRes = await client.query("SELECT * FROM houses_rels WHERE parent_id = $1", [house.id]);
  console.log("\n=== Houses Rels ===");
  console.log(JSON.stringify(relsRes.rows, null, 2));

  await client.end();
}

main().catch(console.error);
