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

  console.log('Listing columns of media table...');
  try {
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'media'
    `);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  }

  console.log('Querying media row for background and construction layer...');
  try {
    const res = await client.query(`
      SELECT id, filename, url FROM media WHERE id IN (866, 873, 876, 874, 875, 880, 877, 879, 881, 867, 869, 870, 871, 872)
    `);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err.message);
  }

  await client.end();
}

main().catch(console.error);
