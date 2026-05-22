const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// Load .env file manually if exists
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
  console.warn('Warning: Could not read .env file:', err.message);
}

const IMAGES_DIR = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/Elegance Comble';

const fileMappings = [
  {
    localName: '1. prapavija.png',
    targetName: 'elegance-comble_1._prapavija.png',
    dbColumn: 'layers_background_layer_id',
    alt: 'Elegance Comble - Arrière-plan',
    mime: 'image/png'
  },
  {
    localName: '2. kons.png',
    targetName: 'elegance-comble_2._kons.png',
    dbColumn: 'layers_construction_layer_id',
    alt: 'Elegance Comble - Structure de construction',
    mime: 'image/png'
  },
  {
    localName: '3. izolimi kulmit.png',
    targetName: 'elegance-comble_3._izolimi_kulmit.png',
    dbColumn: 'layers_roof_polystyrene_id',
    alt: 'Elegance Comble - Isolation polystyrène toiture',
    mime: 'image/png'
  },
  {
    localName: '4. lesh druri.png',
    targetName: 'elegance-comble_4._lesh_druri.png',
    dbColumn: 'layers_iso_inter_bois_id',
    alt: 'Elegance Comble - Isolation murs laine de bois',
    mime: 'image/png'
  },
  {
    localName: '5. lesh xhami.png',
    targetName: 'elegance-comble_5._lesh_xhami.png',
    dbColumn: 'layers_iso_inter_verre_id',
    alt: 'Elegance Comble - Isolation murs laine de verre',
    mime: 'image/png'
  },
  {
    localName: '6. lesh guri ne kulm.png',
    targetName: 'elegance-comble_6._lesh_guri_ne_kulm.png',
    dbColumn: 'layers_roof_roche_id',
    alt: 'Elegance Comble - Isolation toiture laine de roche',
    mime: 'image/png'
  },
  {
    localName: '7. lesh druri ne kulm.png',
    targetName: 'elegance-comble_7._lesh_druri_ne_kulm.png',
    dbColumn: 'layers_roof_bois_id',
    alt: 'Elegance Comble - Isolation toiture laine de bois',
    mime: 'image/png'
  },
  {
    localName: '8. lesh xhami.png',
    targetName: 'elegance-comble_8._lesh_xhami.png',
    dbColumn: 'layers_roof_verre_id',
    alt: 'Elegance Comble - Isolation toiture laine de verre',
    mime: 'image/png'
  },
  {
    localName: '9. stiropori.png',
    targetName: 'elegance-comble_9._stiropori.png',
    dbColumn: 'layers_iso_ext_polystyrene_id',
    alt: 'Elegance Comble - Isolation extérieure polystyrène',
    mime: 'image/png'
  },
  {
    localName: '10. lesh guri jashte.png',
    targetName: 'elegance-comble_10._lesh_guri_jashte.png',
    dbColumn: 'layers_iso_ext_roche_comprimee_id',
    alt: 'Elegance Comble - Isolation extérieure laine de roche',
    mime: 'image/png'
  },
  {
    localName: '11. fibra.png',
    targetName: 'elegance-comble_11._fibra.png',
    dbColumn: 'layers_iso_ext_fibre_id',
    alt: 'Elegance Comble - Isolation extérieure fibre de bois',
    mime: 'image/png'
  },
  {
    localName: '12. folia dhe listelat.png',
    targetName: 'elegance-comble_12._folia_dhe_listelat.png',
    dbColumn: 'layers_couverture_pare_pluie_lattage_id',
    alt: 'Elegance Comble - Pare-pluie et lattage',
    mime: 'image/png'
  },
  {
    localName: '13. fasada e bardhe.png',
    targetName: 'elegance-comble_13._fasada_e_bardhe.png',
    dbColumn: 'layers_facade_blanche_id',
    alt: 'Elegance Comble - Façade enduit blanc',
    mime: 'image/png'
  },
  {
    localName: '14. fasada arish.png',
    targetName: 'elegance-comble_14._fasada_arish.png',
    dbColumn: 'layers_facade_bardage_id',
    alt: 'Elegance Comble - Façade bardage mélèze',
    mime: 'image/png'
  },
  {
    localName: '15. dritaret alumin.png',
    targetName: 'elegance-comble_15._dritaret_alumin.png',
    dbColumn: 'layers_windows_aluminium_id',
    alt: 'Elegance Comble - Menuiseries aluminium',
    mime: 'image/png'
  },
  {
    localName: '16. dritaret pvc.png',
    targetName: 'elegance-comble_16._dritaret_pvc.png',
    dbColumn: 'layers_windows_pvc_id',
    alt: 'Elegance Comble - Menuiseries PVC',
    mime: 'image/png'
  },
  {
    localName: '17. qeremidet.png',
    targetName: 'elegance-comble_17._qeremidet.png',
    dbColumn: 'layers_couverture_tuiles_gouttieres_id',
    alt: 'Elegance Comble - Couverture tuiles et gouttières',
    mime: 'image/png'
  },
  {
    localName: '18. llamarina.png',
    targetName: 'elegance-comble_18._llamarina.png',
    dbColumn: 'layers_couverture_bac_acier_gouttieres_id',
    alt: 'Elegance Comble - Couverture bac acier et gouttières',
    mime: 'image/png'
  },
  {
    localName: '19. lesh guri ne pllake.png',
    targetName: 'elegance-comble_19._lesh_guri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_roche_id',
    alt: 'Elegance Comble - Faux plafond laine de roche',
    mime: 'image/png'
  },
  {
    localName: '20. lesh druri ne pllake.png',
    targetName: 'elegance-comble_20._lesh_druri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_bois_id',
    alt: 'Elegance Comble - Faux plafond laine de bois',
    mime: 'image/png'
  },
  {
    localName: '21. lesh xhami ne pllake.png',
    targetName: 'elegance-comble_21._lesh_xhami_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_verre_id',
    alt: 'Elegance Comble - Faux plafond laine de verre',
    mime: 'image/png'
  },
  {
    localName: 'elegance comble 7.jpg',
    targetName: 'elegance-comble_default.jpg',
    dbColumn: 'default_image_id',
    alt: 'Elegance Comble',
    mime: 'image/jpeg'
  },
  {
    localName: 'elegance comble 5.jpg',
    targetName: 'elegance-comble_final.jpg',
    dbColumn: 'final_image_id',
    alt: 'Elegance Comble - Rendu Final',
    mime: 'image/jpeg'
  }
];

async function main() {
  console.log('=== PHASE 1: S3 Uploads (NO DB Connection Open) ===');

  // Initialize S3 Client
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const uploadMetadata = [];

  for (const mapping of fileMappings) {
    const localFilePath = path.join(IMAGES_DIR, mapping.localName);
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    console.log(`Processing file: ${mapping.localName}`);
    
    // Get image metadata in-memory
    const fileStats = fs.statSync(localFilePath);
    const filesize = fileStats.size;
    const imgMetadata = await sharp(localFilePath).metadata();
    const width = imgMetadata.width;
    const height = imgMetadata.height;
    
    console.log(` - File size: ${filesize} bytes`);
    console.log(` - Dimensions: ${width}x${height}`);

    // Upload to S3
    const fileBuffer = fs.readFileSync(localFilePath);
    console.log(` - Uploading to S3 bucket '${process.env.S3_BUCKET}' as key '${mapping.targetName}'...`);
    
    const startTime = Date.now();
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: mapping.targetName,
      Body: fileBuffer,
      ContentType: mapping.mime,
    }));
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   S3 upload complete in ${duration}s.`);

    uploadMetadata.push({
      mapping,
      filesize,
      width,
      height
    });
  }

  console.log('\n=== PHASE 2: Database Operations ===');

  // Initialize DB Client
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to PostgreSQL database.');

  try {
    await pgClient.query('BEGIN');

    // 1. Clean up any existing database records for this model to support reruns cleanly
    console.log(' - Cleaning up any existing database records with "elegance-comble" pattern...');
    
    // Delete from houses locales first
    await pgClient.query(`
      DELETE FROM houses_locales 
      WHERE _parent_id IN (
        SELECT id FROM houses WHERE slug = 'elegance-comble'
      )
    `);

    // Delete from houses
    await pgClient.query(`
      DELETE FROM houses WHERE slug = 'elegance-comble'
    `);

    // Delete from media locales
    await pgClient.query(`
      DELETE FROM media_locales 
      WHERE _parent_id IN (
        SELECT id FROM media WHERE filename LIKE 'elegance-comble_%'
      )
    `);

    // Delete from media
    const cleanupRes = await pgClient.query(`
      DELETE FROM media WHERE filename LIKE 'elegance-comble_%' RETURNING id
    `);
    console.log(`   Deleted ${cleanupRes.rowCount} previous temporary media records from database.`);

    // 2. Insert new media entries
    const uploadedMediaIds = {};
    console.log(' - Inserting new media entries into database...');
    for (const data of uploadMetadata) {
      const mediaUrl = `/api/media/file/${encodeURIComponent(data.mapping.targetName)}`;
      const mediaQuery = `
        INSERT INTO media (
          updated_at, created_at, url, filename, mime_type, filesize, width, height, focal_x, focal_y
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id
      `;
      const now = new Date();
      const mediaRes = await pgClient.query(mediaQuery, [
        now, now, mediaUrl, data.mapping.targetName, data.mapping.mime, data.filesize, data.width, data.height, 50, 50
      ]);
      const mediaId = mediaRes.rows[0].id;
      uploadedMediaIds[data.mapping.dbColumn] = mediaId;
      console.log(`   Registered ${data.mapping.targetName} as media ID: ${mediaId}`);

      // Insert alt translation into media_locales table
      const mediaLocQuery = `
        INSERT INTO media_locales (
          alt, _locale, _parent_id
        ) VALUES (
          $1, $2, $3
        )
      `;
      await pgClient.query(mediaLocQuery, [data.mapping.alt, 'fr', mediaId]);
    }

    // 3. Insert new house record
    console.log(' - Inserting new houses table record...');
    const now = new Date();
    
    // Collect all values to insert
    const insertHouseQuery = `
      INSERT INTO houses (
        slug,
        category_id,
        default_image_id,
        final_image_id,
        price60x160,
        price60x200,
        margin_percent,
        perdhesa_bruto,
        perdhesa_neto,
        perdhesa_mure_te_jashtme,
        perdhesa_mure_mbajtese,
        perdhesa_mure_ndarese,
        perdhesa_pllaka_e_kulmit,
        perdhesa_kulmi,
        windows_aluminium_price,
        windows_pvc_price,
        enable_flags_enable_roof_option,
        enable_flags_enable_etancheite_option,
        enable_flags_enable_etancheite_terrasse,
        enable_flags_enable_couverture_option,
        enable_flags_enable_faux_plafond_option,
        layers_background_layer_id,
        layers_construction_layer_id,
        layers_iso_inter_verre_id,
        layers_iso_inter_roche_id,
        layers_iso_inter_bois_id,
        layers_iso_ext_roche_comprimee_id,
        layers_iso_ext_polystyrene_id,
        layers_iso_ext_fibre_id,
        layers_facade_blanche_id,
        layers_facade_bardage_id,
        layers_windows_aluminium_id,
        layers_windows_pvc_id,
        layers_roof_polystyrene_id,
        layers_roof_roche_id,
        layers_roof_verre_id,
        layers_roof_bois_id,
        layers_couverture_pare_pluie_lattage_id,
        layers_couverture_tuiles_gouttieres_id,
        layers_couverture_bac_acier_gouttieres_id,
        layers_faux_plafond_verre_id,
        layers_faux_plafond_roche_id,
        layers_faux_plafond_bois_id,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45
      ) RETURNING id
    `;

    const houseRes = await pgClient.query(insertHouseQuery, [
      'elegance-comble',                                 // $1
      4,                                                 // $2 (maison-combles-ammenageable)
      uploadedMediaIds['default_image_id'],             // $3
      uploadedMediaIds['final_image_id'],               // $4
      28500,                                             // $5
      30000,                                             // $6
      40,                                                // $7
      135.5,                                             // $8
      118.2,                                             // $9
      145,                                               // $10
      30,                                                // $11
      65,                                                // $12
      85,                                                // $13
      130,                                               // $14
      7564,                                              // $15
      6176,                                              // $16
      true,                                              // $17 (enableRoofOption)
      false,                                             // $18 (enableEtancheiteOption)
      false,                                             // $19 (enableEtancheiteTerrasse)
      true,                                              // $20 (enableCouvertureOption)
      true,                                              // $21 (enableFauxPlafondOption)
      uploadedMediaIds['layers_background_layer_id'],    // $22
      uploadedMediaIds['layers_construction_layer_id'],  // $23
      uploadedMediaIds['layers_iso_inter_verre_id'],      // $24
      null,                                              // $25 (no rock wool)
      uploadedMediaIds['layers_iso_inter_bois_id'],       // $26
      uploadedMediaIds['layers_iso_ext_roche_comprimee_id'], // $27
      uploadedMediaIds['layers_iso_ext_polystyrene_id'],  // $28
      uploadedMediaIds['layers_iso_ext_fibre_id'],        // $29
      uploadedMediaIds['layers_facade_blanche_id'],       // $30
      uploadedMediaIds['layers_facade_bardage_id'],       // $31
      uploadedMediaIds['layers_windows_aluminium_id'],    // $32
      uploadedMediaIds['layers_windows_pvc_id'],          // $33
      uploadedMediaIds['layers_roof_polystyrene_id'],    // $34
      uploadedMediaIds['layers_roof_roche_id'],          // $35
      uploadedMediaIds['layers_roof_verre_id'],          // $36
      uploadedMediaIds['layers_roof_bois_id'],           // $37
      uploadedMediaIds['layers_couverture_pare_pluie_lattage_id'], // $38
      uploadedMediaIds['layers_couverture_tuiles_gouttieres_id'],  // $39
      uploadedMediaIds['layers_couverture_bac_acier_gouttieres_id'], // $40
      uploadedMediaIds['layers_faux_plafond_verre_id'],  // $41
      uploadedMediaIds['layers_faux_plafond_roche_id'],  // $42
      uploadedMediaIds['layers_faux_plafond_bois_id'],   // $43
      now,                                               // $44
      now                                                // $45
    ]);

    const houseId = houseRes.rows[0].id;
    console.log(`Successfully inserted new house 'Elegance Comble' with ID: ${houseId}`);

    // 4. Insert locales row
    console.log(' - Inserting houses_locales table record...');
    const insertLocalesQuery = `
      INSERT INTO houses_locales (
        title,
        subheading,
        description,
        specification,
        structure_info,
        _locale,
        _parent_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
    `;

    await pgClient.query(insertLocalesQuery, [
      'Elegance Comble', // title
      'Découvrez Elegance Comble, un modèle de maison d\'exception à combles aménageables avec une structure bois performante.', // subheading
      'Le modèle Elegance Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d\'aménagement optimale pour s\'adapter à l\'évolution de votre famille. Sa structure robuste en ossature bois à haute efficacité thermique garantit un confort de vie inégalé en toutes saisons.', // description
      'Maison moderne à combles aménageables.', // specification
      'Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l\'ensemble. Comprend les murs porteurs, murs de séparation et charpente bois de type combles aménageables. Le prix inclut le transport et le montage sur site sous garantie décennale.', // structure_info
      'fr', // locale
      houseId // parent_id
    ]);
    console.log(`Successfully inserted houses_locales entry for house ID ${houseId}`);

    await pgClient.query('COMMIT');
    console.log('\n=== Database Transaction Successfully Committed ===');
  } catch (err) {
    await pgClient.query('ROLLBACK');
    console.error('Database transaction failed and was rolled back:', err);
    throw err;
  } finally {
    await pgClient.end();
    console.log('Database connection closed.');
  }
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
