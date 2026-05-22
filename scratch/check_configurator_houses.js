const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const res = await client.query(`
    SELECT id, slug, layers_background_layer_id, layers_construction_layer_id
    FROM houses
    WHERE layers_background_layer_id IS NOT NULL AND layers_construction_layer_id IS NOT NULL
    ORDER BY id
  `);
  console.log("=== Configurator Houses ===");
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
