const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) throw new Error('.env file not found');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1].trim()] = value;
    }
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const client = new Client({ connectionString: env.DATABASE_URI });
  await client.connect();

  console.log('Searching for monna-me-atike in houses table...');
  try {
    const res = await client.query("SELECT * FROM houses WHERE slug = 'monna-me-atike'");
    console.log(`Found ${res.rows.length} rows.`);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      console.log('--- MONNA HOUSE DETAIL ---');
      for (const [key, value] of Object.entries(row)) {
        if (value !== null && value !== undefined) {
          console.log(`${key}: ${value}`);
        }
      }
    } else {
      console.log('House monna-me-atike not found!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }

  await client.end();
}

main().catch(console.error);
