const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    const res = await client.query("SELECT id, filename, url, created_at FROM media ORDER BY id DESC LIMIT 20");
    console.log('Latest 20 media records:');
    res.rows.forEach(r => console.log(`- ID: ${r.id}, Filename: ${r.filename}, URL: ${r.url}, Created: ${r.created_at}`));
  } catch (e) {
    console.error('Error:', e.message);
  }

  await client.end();
}

main().catch(console.error);
