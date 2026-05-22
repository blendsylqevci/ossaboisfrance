const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== Houses Table Schema & Sample ===");
  const housesRes = await client.query("SELECT * FROM houses WHERE id IN (1, 4, 32) OR slug = 'ambre'");
  console.log(JSON.stringify(housesRes.rows, null, 2));

  console.log("\n=== Houses Locales Table Sample ===");
  const localesRes = await client.query("SELECT * FROM houses_locales WHERE _parent_id IN (1, 4, 32)");
  console.log(localesRes.rows);

  await client.end();
}

main().catch(console.error);
