const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
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
  }
} catch (err) {
  console.error(err);
}

async function main() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  console.log('=== HOUSES ===');
  const housesRes = await pgClient.query(`
    SELECT id, slug, default_image_id, final_image_id, created_at, updated_at
    FROM houses
    WHERE slug IN ('cotage-toiture-terrasse', 'asebra-me-atike', 'elegance-comble')
  `);
  console.log(JSON.stringify(housesRes.rows, null, 2));

  console.log('=== MEDIA ===');
  const mediaRes = await pgClient.query(`
    SELECT id, filename, url, filesize, created_at, updated_at
    FROM media
    WHERE id IN (294, 295, 337, 338, 525, 526)
  `);
  console.log(JSON.stringify(mediaRes.rows, null, 2));

  await pgClient.end();
}

main().catch(console.error);
