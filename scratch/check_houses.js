const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  const res = await client.query("SELECT id, filename, url FROM media WHERE filename LIKE '%ambre%' LIMIT 50");
  console.log("Media matching ambre:", res.rows);
  await client.end();
}

main().catch(console.error);
