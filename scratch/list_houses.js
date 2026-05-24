const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT h.id, hl.title, h.slug, hc.slug as category_slug
    FROM houses h
    LEFT JOIN houses_locales hl ON h.id = hl._parent_id AND hl._locale = 'fr'
    LEFT JOIN house_categories hc ON h.category_id = hc.id
    ORDER BY hl.title, h.id
  `);
  console.log("=== Houses in DB ===");
  res.rows.forEach(r => {
    console.log(`- ${r.title} (slug: ${r.slug}, category: ${r.category_slug || 'N/A'}, id: ${r.id})`);
  });

  await client.end();
}

main().catch(console.error);
