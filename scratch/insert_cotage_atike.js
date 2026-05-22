const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// 1. Load env variables
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach((line) => {
      if (line.trim().startsWith('#') || !line.includes('=')) return;
      const delimiterIdx = line.indexOf('=');
      const key = line.slice(0, delimiterIdx).trim();
      let val = line.slice(delimiterIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    });
    console.log('Loaded env variables from .env file.');
  }
} catch (err) {
  console.error('Error loading env file:', err);
}

// Configuration
const HOUSE_SLUG = 'cotage-toiture-terrasse';
const SOURCE_DIR = path.join(__dirname, '..', 'public', 'images', 'houses', 'cotage me atike');

// List of layers to process and upload
const filesToProcess = [
  { file: '1. Parahyrja.png', key: 'cotage-atike_1._Parahyrja.png', layer: 'background' },
  { file: '2. kons.png', key: 'cotage-atike_2._kons.png', layer: 'construction' },
  { file: '3. lesh guri.png', key: 'cotage-atike_3._lesh_guri.png', layer: 'iso_inter_roche' },
  { file: '4. lesh druri.png', key: 'cotage-atike_4._lesh_druri.png', layer: 'iso_inter_bois' },
  { file: '5. lesh xhami.png', key: 'cotage-atike_5._lesh_xhami.png', layer: 'iso_inter_verre' },
  { file: '6. stiropori.png', key: 'cotage-atike_6._stiropori.png', layer: 'iso_ext_polystyrene' },
  { file: '7. fibra.png', key: 'cotage-atike_7._fibra.png', layer: 'iso_ext_fibre' },
  { file: '8. lesh guri.png', key: 'cotage-atike_8._lesh_guri.png', layer: 'iso_ext_roche_comprimee' },
  { file: '9. stiropori.png', key: 'cotage-atike_9._stiropori.png', layer: 'terrace_etancheite_epdm' },
  { file: '10. epdm.png', key: 'cotage-atike_10._epdm.png', layer: 'etancheite_epdm' },
  { file: '11. fasada e bardhe.png', key: 'cotage-atike_11._fasada_e_bardhe.png', layer: 'facade_blanche' },
  { file: '12. fasada arish.png', key: 'cotage-atike_12._fasada_arish.png', layer: 'facade_bardage' },
  { file: '13. dritaret antracid.png', key: 'cotage-atike_13._dritaret_antracid.png', layer: 'windows_aluminium' },
  { file: '14. dritaret pvc.png', key: 'cotage-atike_14._dritaret_pvc.png', layer: 'windows_pvc' },
  { file: '4 cottage.jpg', key: 'cotage-atike_default.jpg', layer: 'default_image' },
  { file: '5 cottage.jpg', key: 'cotage-atike_final.jpg', layer: 'final_image' }
];

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: true,
});

async function main() {
  console.log('=== PHASE 1: S3 Uploads (NO DB Connection Open) ===');
  
  const uploadResults = [];

  for (const item of filesToProcess) {
    const filePath = path.join(SOURCE_DIR, item.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file not found: ${filePath}`);
    }

    console.log(`Processing file: ${item.file}`);
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    
    // Get dimensions
    const metadata = await sharp(fileBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;
    console.log(` - File size: ${stats.size} bytes`);
    console.log(` - Dimensions: ${width}x${height}`);

    const mimeType = item.file.endsWith('.jpg') || item.file.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';

    // Upload to S3
    console.log(` - Uploading to S3 bucket '${process.env.S3_BUCKET}' as key '${item.key}'...`);
    const startTime = Date.now();
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: item.key,
      Body: fileBuffer,
      ContentType: mimeType,
    }));
    console.log(`   S3 upload complete in ${((Date.now() - startTime) / 1000).toFixed(1)}s.`);

    uploadResults.push({
      fileName: item.file,
      s3Key: item.key,
      layer: item.layer,
      width,
      height,
      mimeType,
      fileSize: stats.size
    });
  }

  console.log('\n=== PHASE 2: Database Operations ===');
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to PostgreSQL database.');

  try {
    await pgClient.query('BEGIN');

    // Clean up old cotage-atike media from DB
    console.log(' - Cleaning up old cotage-atike media from DB...');
    await pgClient.query(`
      DELETE FROM media_locales 
      WHERE _parent_id IN (
        SELECT id FROM media WHERE filename LIKE 'cotage-atike\\_%' ESCAPE '\\'
      )
    `);
    const cleanupRes = await pgClient.query(`
      DELETE FROM media WHERE filename LIKE 'cotage-atike\\_%' ESCAPE '\\' RETURNING id
    `);
    console.log(`   Deleted ${cleanupRes.rowCount} previous media records.`);

    const mediaMap = {};

    // Insert media records
    for (const info of uploadResults) {
      const url = `/api/media/file/${encodeURIComponent(info.s3Key)}`;
      
      const now = new Date();
      const mediaRes = await pgClient.query(
        `INSERT INTO media (filename, mime_type, filesize, width, height, url, updated_at, created_at, focal_x, focal_y)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 50, 50)
         RETURNING id`,
        [info.s3Key, info.mimeType, info.fileSize, info.width, info.height, url, now, now]
      );
      
      const mediaId = mediaRes.rows[0].id;
      mediaMap[info.layer] = mediaId;
      console.log(`   Registered ${info.s3Key} as media ID: ${mediaId}`);

      // Insert media_locales (French)
      await pgClient.query(
        `INSERT INTO media_locales (alt, _locale, _parent_id)
         VALUES ($1, $2, $3)`,
        [info.fileName.replace(/\.[^/.]+$/, ""), 'fr', mediaId]
      );
    }

    // Find the house row
    const houseQuery = await pgClient.query("SELECT id FROM houses WHERE slug = $1", [HOUSE_SLUG]);
    if (houseQuery.rows.length === 0) {
      throw new Error(`House not found with slug: ${HOUSE_SLUG}`);
    }
    const houseId = houseQuery.rows[0].id;
    console.log(`Found existing house ${HOUSE_SLUG} with ID: ${houseId}. Updating it...`);

    // Update house values
    await pgClient.query(
      `UPDATE houses
       SET 
         category_id = 1, -- Toiture Terrasse
         default_image_id = $1,
         final_image_id = $2,
         price60x160 = 23400,
         price60x200 = 24900,
         margin_percent = 40,
         enable_flags_enable_roof_option = false,
         enable_flags_enable_etancheite_option = true,
         enable_flags_enable_etancheite_terrasse = true,
         enable_flags_enable_couverture_option = false,
         enable_flags_enable_faux_plafond_option = false,
         layers_background_layer_id = $3,
         layers_construction_layer_id = $4,
         layers_iso_inter_roche_id = $5,
         layers_iso_inter_bois_id = $6,
         layers_iso_inter_verre_id = $7,
         layers_iso_ext_polystyrene_id = $8,
         layers_iso_ext_fibre_id = $9,
         layers_iso_ext_roche_comprimee_id = $10,
         layers_terrace_etancheite_epdm_id = $11,
         layers_etancheite_epdm_id = $12,
         layers_facade_blanche_id = $13,
         layers_facade_bardage_id = $14,
         layers_windows_aluminium_id = $15,
         layers_windows_pvc_id = $16,
         updated_at = NOW()
       WHERE id = $17`,
      [
        mediaMap['default_image'],
        mediaMap['final_image'],
        mediaMap['background'],
        mediaMap['construction'],
        mediaMap['iso_inter_roche'],
        mediaMap['iso_inter_bois'],
        mediaMap['iso_inter_verre'],
        mediaMap['iso_ext_polystyrene'],
        mediaMap['iso_ext_fibre'],
        mediaMap['iso_ext_roche_comprimee'],
        mediaMap['terrace_etancheite_epdm'],
        mediaMap['etancheite_epdm'],
        mediaMap['facade_blanche'],
        mediaMap['facade_bardage'],
        mediaMap['windows_aluminium'],
        mediaMap['windows_pvc'],
        houseId
      ]
    );

    console.log(`Successfully updated house with ID: ${houseId}`);

    // Update or insert houses_locales description & specifications
    console.log(' - Updating houses_locales record...');
    await pgClient.query("DELETE FROM houses_locales WHERE _parent_id = $1", [houseId]);

    const insertHouseLocQuery = `
      INSERT INTO houses_locales (
        title,
        subheading,
        description,
        structure_info,
        _locale,
        _parent_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
    `;

    const frenchDescription = `Le modèle Cotage Toiture Terrasse incarne une architecture moderne, épurée et chaleureuse, pensée pour offrir un équilibre parfait entre design contemporain, fonctionnalité et bien-être au quotidien.\n\nAvec ses lignes minimalistes, sa toiture terrasse élégante et ses finitions haut de gamme en bois naturel ou façade moderne, cette maison s’intègre harmonieusement dans tous les environnements, qu’ils soient urbains, résidentiels ou en pleine nature.\n\nSon espace de vie lumineux, ses larges ouvertures et sa conception intelligente créent une atmosphère privée et accueillante, idéale pour une résidence principale, une maison de vacances ou un projet de vie moderne.\n\nConstruite avec une structure bois performante et durable, la Cotage Toiture Terrasse garantit une excellente isolation thermique, un confort optimal en toutes saisons.`;
    const frenchSubheading = `Cotage Toiture Terrasse — L’élégance contemporaine au service du confort naturel.`;
    const frenchStructureInfo = `Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l’ensemble. Le prix inclut le transport et le montage sur site.`;

    await pgClient.query(insertHouseLocQuery, [
      'Cotage Toiture Terrasse',
      frenchSubheading,
      frenchDescription,
      frenchStructureInfo,
      'fr',
      houseId
    ]);

    console.log(' - Inserted French localization in houses_locales.');

    await pgClient.query('COMMIT');
    console.log('\n=== Database Transaction Successfully Committed ===');

  } catch (dbErr) {
    await pgClient.query('ROLLBACK');
    console.error('Database transaction failed and rolled back:', dbErr);
    throw dbErr;
  } finally {
    await pgClient.end();
    console.log('Database connection closed.');
  }
}

main().catch((err) => {
  console.error('\n!!! Fatal Error during migration !!!');
  console.error(err);
  process.exit(1);
});
