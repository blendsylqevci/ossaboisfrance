const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  // 1. Get tables list or columns of 'houses'
  const columnsRes = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'houses'
  `);
  console.log("Houses columns:");
  columnsRes.rows.forEach(c => console.log(` - ${c.column_name}: ${c.data_type}`));

  // 2. Get categories
  const categoriesRes = await client.query("SELECT * FROM categories");
  console.log("\nCategories:", categoriesRes.rows);

  // 3. Get existing houses
  const housesRes = await client.query("SELECT id, title, slug, category_id FROM houses");
  console.log("\nHouses:", housesRes.rows);

  await client.end();
}

main().catch(console.error);
