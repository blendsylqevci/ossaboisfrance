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

  const slugs = ['a-frame-house', 'cotage-toiture-terrasse', 'asebra-me-atike', 'elegance-comble'];
  const res = await pgClient.query(`
    SELECT h.slug, h.default_image_id, h.final_image_id,
           m1.url as default_url, m2.url as final_url
    FROM houses h
    LEFT JOIN media m1 ON h.default_image_id = m1.id
    LEFT JOIN media m2 ON h.final_image_id = m2.id
    WHERE h.slug = ANY($1)
  `, [slugs]);

  console.log(JSON.stringify(res.rows, null, 2));

  await pgClient.end();
}

main().catch(console.error);
