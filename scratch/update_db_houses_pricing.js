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

  console.log('Running pricing migration...');
  const res = await pgClient.query(`
    UPDATE houses
    SET price60x160 = CASE
                        WHEN perdhesa_neto >= 131 THEN (perdhesa_neto * 350) + 3500
                        ELSE perdhesa_neto * 350
                      END,
        price60x200 = CASE
                        WHEN perdhesa_neto >= 131 THEN (perdhesa_neto * 370) + 3500
                        ELSE perdhesa_neto * 370
                      END
    WHERE perdhesa_neto IS NOT NULL AND perdhesa_neto > 0
    RETURNING id, slug, price60x160, price60x200, perdhesa_neto;
  `);

  console.log(`Successfully updated ${res.rowCount} houses in database:`);
  for (const row of res.rows) {
    console.log(`- ${row.slug.padEnd(30)}: Neto = ${(row.perdhesa_neto + '').padStart(5)}m² | 60x160 = ${(row.price60x160 + '').padStart(7)}€ | 60x200 = ${(row.price60x200 + '').padStart(7)}€`);
  }

  await pgClient.end();
}

main().catch(console.error);
