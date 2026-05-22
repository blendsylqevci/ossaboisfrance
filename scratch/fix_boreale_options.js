const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== Disabling roof and faux-plafond options for Boreale (ID 5) ===");
  const updateQuery = `
    UPDATE houses
    SET
      enable_flags_enable_roof_option = false,
      enable_flags_enable_faux_plafond_option = false,
      layers_roof_roche_id = null,
      layers_roof_verre_id = null,
      layers_faux_plafond_verre_id = null,
      layers_faux_plafond_roche_id = null,
      layers_faux_plafond_bois_id = null,
      updated_at = NOW()
    WHERE id = 5
    RETURNING id, enable_flags_enable_roof_option, enable_flags_enable_faux_plafond_option
  `;

  const res = await client.query(updateQuery);
  console.log("Update result:", res.rows);

  await client.end();
  console.log("Database connection closed.");
}

main().catch(console.error);
