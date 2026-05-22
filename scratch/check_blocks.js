const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const tables = [
    'houses_blocks_boolean_value',
    'houses_blocks_image_value',
    'houses_blocks_number_value',
    'houses_blocks_repeater_value',
    'houses_blocks_select_value',
    'houses_blocks_text_value',
    'houses_blocks_textarea_value'
  ];

  for (const table of tables) {
    const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`${table} count: ${res.rows[0].count}`);
  }

  await client.end();
}

main().catch(console.error);
