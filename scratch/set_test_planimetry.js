const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const delimiterIdx = line.indexOf('=');
    const key = line.slice(0, delimiterIdx).trim();
    let val = line.slice(delimiterIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  });
} catch (e) {
  console.error("Could not load .env file:", e.message);
}

const connectionString = process.env.DATABASE_URI;

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Fetching one media file for testing planimetry...");
  const mediaRes = await client.query("SELECT id, url, filename FROM media LIMIT 1");
  
  if (mediaRes.rows.length === 0) {
    console.error("No media files found in database to assign as a test planimetry.");
    await client.end();
    return;
  }
  
  const testMedia = mediaRes.rows[0];
  console.log(`Found media file: ${testMedia.filename} (ID: ${testMedia.id})`);
  
  console.log("Updating house matching '%symphonie%' to use this test media as planimetry...");
  const updateRes = await client.query(
    "UPDATE houses SET planimetry_id = $1 WHERE slug LIKE '%symphonie%' RETURNING id, slug, planimetry_id",
    [testMedia.id]
  );
  
  if (updateRes.rows.length > 0) {
    console.log("Successfully updated Symphonie house record:", updateRes.rows[0]);
  } else {
    console.error("Symphonie house record was not found or not updated.");
  }

  await client.end();
}

main().catch(console.error);
