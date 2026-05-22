const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== Calme me atike houses row ===");
  const res = await client.query("SELECT * FROM houses WHERE id = 33 OR slug = 'calme-me-atike'");
  console.log(JSON.stringify(res.rows, null, 2));

  console.log("=== Calme me atike locale row ===");
  const resLoc = await client.query("SELECT * FROM houses_locales WHERE _parent_id = 33");
  console.log(resLoc.rows);

  await client.end();
}

main().catch(console.error);
