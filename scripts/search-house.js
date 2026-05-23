const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
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

  console.log('Searching for "marinela" in houses table...');
  try {
    const res = await client.query("SELECT id, slug, category_id FROM houses WHERE slug LIKE '%marinela%'");
    console.log(`Found ${res.rows.length} rows:`, res.rows);
  } catch (err) {
    console.error(err.message);
  }
  await client.end();
}

main().catch(console.error);
