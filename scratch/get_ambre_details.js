const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const res = await client.query("SELECT * FROM houses WHERE id IN (1, 4)");
  console.log("Ambre houses:");
  res.rows.forEach(r => {
    console.log(`\n--- House id: ${r.id}, slug: ${r.slug} ---`);
    for (const [key, value] of Object.entries(r)) {
      if (value !== null) {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      }
    }
  });

  await client.end();
}

main().catch(console.error);
