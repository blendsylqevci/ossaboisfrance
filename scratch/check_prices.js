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

  const res = await pgClient.query("SELECT slug, price60x160, price60x200, category_id FROM houses ORDER BY category_id, slug");
  console.log(JSON.stringify(res.rows, null, 2));

  await pgClient.end();
}

main().catch(console.error);
