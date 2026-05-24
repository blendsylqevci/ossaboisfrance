const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const http = require('http');

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244$$$.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  // Find Australe
  const houseRes = await client.query("SELECT * FROM houses WHERE slug = 'australe'");
  if (houseRes.rows.length === 0) {
    console.log("No house found with slug 'australe'");
    await client.end();
    return;
  }
  const house = houseRes.rows[0];
  const defId = house.default_image_id;
  const finId = house.final_image_id;

  console.log(`Australe has default_image_id=${defId}, final_image_id=${finId}`);

  // Fetch URL/filename from media table
  const mediaRes = await client.query("SELECT id, url, filename FROM media WHERE id IN ($1, $2)", [defId, finId]);
  console.log("Media records:", mediaRes.rows);

  for (const row of mediaRes.rows) {
    // URL looks like "/api/media/file/filename.jpg"
    // Fetch it from local dev server
    const localUrl = `http://localhost:3000${row.url}`;
    const destName = row.id === defId ? 'db_default.jpg' : 'db_final.jpg';
    const destPath = path.join('/Users/blendsylqevci/.gemini/antigravity-ide/brain/e81b0b00-dbda-4a74-b948-3cb2cd53caf7', destName);
    console.log(`Downloading ${localUrl} to ${destPath}...`);
    try {
      await downloadFile(localUrl, destPath);
      console.log(`Successfully downloaded ${destName}`);
    } catch (err) {
      console.error(`Failed to download ${row.url}:`, err);
    }
  }

  await client.end();
}

main().catch(console.error);
