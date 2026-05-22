const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  console.log("=== Boreale House Details ===");
  const housesRes = await client.query("SELECT * FROM houses WHERE id = 5");
  console.log(JSON.stringify(housesRes.rows, null, 2));

  console.log("\n=== Boreale Houses Locales ===");
  const localesRes = await client.query("SELECT * FROM houses_locales WHERE _parent_id = 5");
  console.log(localesRes.rows);

  // Let's get media URLs and filenames that are currently associated with ID 5
  if (housesRes.rows.length > 0) {
    const house = housesRes.rows[0];
    const mediaColumns = [
      'default_image_id', 'final_image_id',
      'layers_background_layer_id', 'layers_construction_layer_id',
      'layers_iso_inter_verre_id', 'layers_iso_inter_roche_id', 'layers_iso_inter_bois_id',
      'layers_iso_ext_roche_comprimee_id', 'layers_iso_ext_polystyrene_id', 'layers_iso_ext_fibre_id',
      'layers_terrace_etancheite_epdm_id', 'layers_etancheite_epdm_id',
      'layers_facade_blanche_id', 'layers_facade_bardage_id',
      'layers_windows_aluminium_id', 'layers_windows_pvc_id',
      'layers_roof_roche_id', 'layers_roof_verre_id',
      'layers_faux_plafond_verre_id', 'layers_faux_plafond_roche_id', 'layers_faux_plafond_bois_id'
    ];
    
    const mediaIds = [];
    mediaColumns.forEach(col => {
      if (house[col]) {
        mediaIds.push(house[col]);
      }
    });

    if (mediaIds.length > 0) {
      console.log(`\n=== Media files to clean up (IDs: ${mediaIds.join(', ')}) ===`);
      const mediaRes = await client.query("SELECT id, filename, url FROM media WHERE id = ANY($1)", [mediaIds]);
      console.log(JSON.stringify(mediaRes.rows, null, 2));
    } else {
      console.log("\nNo media IDs associated with this house.");
    }
  }

  await client.end();
}

main().catch(console.error);
