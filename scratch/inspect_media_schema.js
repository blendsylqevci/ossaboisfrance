const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== Columns of media ===");
  const mediaCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'media'
  `);
  mediaCols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  console.log("\n=== Columns of media_locales ===");
  const mediaLocCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'media_locales'
  `);
  mediaLocCols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

  console.log("\n=== Sample row from media ===");
  const sampleMedia = await client.query("SELECT * FROM media ORDER BY id DESC LIMIT 1");
  console.log(JSON.stringify(sampleMedia.rows, null, 2));

  console.log("\n=== Sample row from media_locales ===");
  if (sampleMedia.rows.length > 0) {
    const sampleMediaLoc = await client.query("SELECT * FROM media_locales WHERE _parent_id = $1", [sampleMedia.rows[0].id]);
    console.log(sampleMediaLoc.rows);
  }

  await client.end();
}

main().catch(console.error);
