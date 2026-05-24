const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244$$$.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const housesRes = await client.query("SELECT id, title, slug FROM houses");
  console.log("=== Houses in DB ===");
  console.log(housesRes.rows);

  await client.end();
}

main().catch(console.error);
