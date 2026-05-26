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

  const housesRes = await pgClient.query(`
    SELECT id, slug
    FROM houses
    ORDER BY slug ASC
  `);
  console.log('--- HOUSES IN DATABASE ---');
  console.log(housesRes.rows);

  const categoriesRes = await pgClient.query(`
    SELECT id, slug, name
    FROM house_categories
    ORDER BY slug ASC
  `);
  console.log('--- CATEGORIES IN DATABASE ---');
  console.log(categoriesRes.rows);

  await pgClient.end();
}

main().catch(console.error);
