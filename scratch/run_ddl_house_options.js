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
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Adding price_rate60x160 and price_rate60x200 columns to house_options table...");
  
  await client.query("BEGIN");
  try {
    await client.query(`
      ALTER TABLE house_options 
      ADD COLUMN IF NOT EXISTS price_rate60x160 numeric DEFAULT 350;
    `);
    await client.query(`
      ALTER TABLE house_options 
      ADD COLUMN IF NOT EXISTS price_rate60x200 numeric DEFAULT 370;
    `);

    await client.query("COMMIT");
    console.log("Columns successfully added!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  }

  await client.end();
}

main().catch(console.error);
