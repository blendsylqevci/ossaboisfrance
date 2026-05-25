const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  const res = await client.query(`
    SELECT hl.id, hl._locale, hl.subheading, hl.description, h.slug
    FROM houses_locales hl
    JOIN houses h ON hl._parent_id = h.id
    ORDER BY h.slug, hl._locale
  `);
  
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
