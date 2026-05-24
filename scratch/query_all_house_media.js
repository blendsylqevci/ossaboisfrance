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

  console.log('=== ASEBRA MEDIA ===');
  let res = await pgClient.query(`
    SELECT id, url, filename, filesize, mime_type, created_at, updated_at
    FROM media
    WHERE filename LIKE '%asebra%'
    ORDER BY id ASC
  `);
  console.log(res.rows);

  console.log('=== COTAGE MEDIA ===');
  res = await pgClient.query(`
    SELECT id, url, filename, filesize, mime_type, created_at, updated_at
    FROM media
    WHERE filename LIKE '%cotage%' OR filename LIKE '%cottage%'
    ORDER BY id ASC
  `);
  console.log(res.rows);

  console.log('=== ELEGANCE MEDIA ===');
  res = await pgClient.query(`
    SELECT id, url, filename, filesize, mime_type, created_at, updated_at
    FROM media
    WHERE filename LIKE '%elegance%'
    ORDER BY id ASC
  `);
  console.log(res.rows);

  await pgClient.end();
}

main().catch(console.error);
