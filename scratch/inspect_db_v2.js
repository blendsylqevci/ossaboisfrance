const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== house_categories ===");
  const catRes = await client.query("SELECT * FROM house_categories");
  console.log(catRes.rows);

  console.log("\n=== house_categories_locales ===");
  const catLocRes = await client.query("SELECT * FROM house_categories_locales");
  console.log(catLocRes.rows);

  console.log("\n=== houses ===");
  const housesRes = await client.query("SELECT id, slug, category_id FROM houses");
  console.log(housesRes.rows);

  console.log("\n=== houses_locales ===");
  const housesLocRes = await client.query("SELECT id, parent_id, locale, title, description FROM houses_locales");
  console.log(housesLocRes.rows);

  await client.end();
}

main().catch(console.error);
