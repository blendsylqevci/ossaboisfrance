const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("=== house_options ===");
  const optionsRes = await client.query("SELECT * FROM house_options");
  console.log(optionsRes.rows);

  console.log("\n=== global_roof_options (etancheite options) ===");
  const roofOpts = await client.query(`
    SELECT o.*, l.option_name, l.option_description 
    FROM house_options_global_roof_options o
    LEFT JOIN house_options_global_roof_options_locales l ON o.id = l._parent_id AND l._locale = 'fr'
  `);
  console.log(roofOpts.rows);

  console.log("\n=== global_couverture_options (couverture options) ===");
  const couvOpts = await client.query(`
    SELECT o.*, l.option_name, l.option_description 
    FROM house_options_global_couverture_options o
    LEFT JOIN house_options_global_couverture_options_locales l ON o.id = l._parent_id AND l._locale = 'fr'
  `);
  console.log(couvOpts.rows);

  await client.end();
}

main().catch(console.error);
