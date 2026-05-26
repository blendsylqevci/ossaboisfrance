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
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  const housesRes = await pgClient.query(`
    SELECT id, slug, price60x160, price60x200, perdhesa_bruto
    FROM houses
    ORDER BY slug ASC
  `);
  
  console.log('--- HOUSES IN DATABASE WITH BRUTO AND BASE PRICES ---');
  for (const row of housesRes.rows) {
    console.log(`Slug: ${row.slug.padEnd(30)} | Bruto: ${(row.perdhesa_bruto + '').padStart(5)} | Price 60x160: ${(row.price60x160 + '').padStart(7)} | Price 60x200: ${(row.price60x200 + '').padStart(7)}`);
  }

  await pgClient.end();
}

main().catch(console.error);
