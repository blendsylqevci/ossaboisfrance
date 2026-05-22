const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== COLUMNS FOR houses ===");
  const housesCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'houses'
    ORDER BY column_name;
  `);
  housesCols.rows.forEach(r => {
    console.log(`${r.column_name}: ${r.data_type}`);
  });

  console.log("\n=== COLUMNS FOR houses_locales ===");
  const localesCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'houses_locales'
    ORDER BY column_name;
  `);
  localesCols.rows.forEach(r => {
    console.log(`${r.column_name}: ${r.data_type}`);
  });

  await client.end();
}

main().catch(console.error);
