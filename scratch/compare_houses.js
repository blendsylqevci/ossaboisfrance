const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== Fetching houses ===");
  const res = await client.query("SELECT id, slug, category_id, enable_roof_option, enable_etancheite_option, enable_etancheite_terrasse, enable_couverture_option, enable_faux_plafond_option FROM houses WHERE slug IN ('cristal', 'elegance-comble')");
  console.log(JSON.stringify(res.rows, null, 2));

  console.log("\n=== Custom Fields ===");
  const resCustom = await client.query("SELECT h.slug, h.id, hl._locale, hl.title, hl.subheading, hl.description, hl.custom_fields, hl.dynamic_fields_config, hl.slider_config FROM houses h JOIN houses_locales hl ON hl._parent_id = h.id WHERE h.slug IN ('cristal', 'elegance-comble')");
  for (const row of resCustom.rows) {
    console.log(`\n--- ${row.slug} (${row._locale}) ---`);
    console.log("Title:", row.title);
    console.log("Slider Config:", JSON.stringify(row.slider_config, null, 2));
    console.log("Dynamic Fields Config keys:", Object.keys(row.dynamic_fields_config || {}));
  }

  await client.end();
}

main().catch(console.error);
