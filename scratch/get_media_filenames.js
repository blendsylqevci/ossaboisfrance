const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 143, 144, 145, 146, 147];
  const res = await client.query("SELECT id, filename, url FROM media WHERE id = ANY($1)", [ids]);
  console.log("Media details:");
  res.rows.forEach(r => {
    console.log(`  id: ${r.id}, filename: "${r.filename}", url: "${r.url}"`);
  });

  await client.end();
}

main().catch(console.error);
