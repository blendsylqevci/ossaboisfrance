const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
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

const IMAGES_DIR = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/asebra me atike';

const fileMappings = [
  {
    localName: '1. Prapavija.png',
    targetName: 'asebra-me-atike_1._prapavija.png',
    dbColumn: 'layers_background_layer_id',
    alt: 'Asebra avec Attique - 1. Prapavija.png',
    mime: 'image/png'
  },
  {
    localName: '2. kons.png',
    targetName: 'asebra-me-atike_2._kons.png',
    dbColumn: 'layers_construction_layer_id',
    alt: 'Asebra avec Attique - 2. kons.png',
    mime: 'image/png'
  },
  {
    localName: '3. lesh guri.png',
    targetName: 'asebra-me-atike_3._lesh_guri.png',
    dbColumn: 'layers_iso_inter_roche_id',
    alt: 'Asebra avec Attique - 3. lesh guri.png',
    mime: 'image/png'
  },
  {
    localName: '4. lesh druri.png',
    targetName: 'asebra-me-atike_4._lesh_druri.png',
    dbColumn: 'layers_iso_inter_bois_id',
    alt: 'Asebra avec Attique - 4. lesh druri.png',
    mime: 'image/png'
  },
  {
    localName: '5. lesh xhami.png',
    targetName: 'asebra-me-atike_5._lesh_xhami.png',
    dbColumn: 'layers_iso_inter_verre_id',
    alt: 'Asebra avec Attique - 5. lesh xhami.png',
    mime: 'image/png'
  },
  {
    localName: '6. stiropori.png',
    targetName: 'asebra-me-atike_6._stiropori.png',
    dbColumn: 'layers_iso_ext_polystyrene_id',
    alt: 'Asebra avec Attique - 6. stiropori.png',
    mime: 'image/png'
  },
  {
    localName: '8. leshi gurit jashte.png',
    targetName: 'asebra-me-atike_7._lesh_guri_jashte.png',
    dbColumn: 'layers_iso_ext_roche_comprimee_id',
    alt: 'Asebra avec Attique - 8. leshi gurit jashte.png',
    mime: 'image/png'
  },
  {
    localName: '7. fibra.png',
    targetName: 'asebra-me-atike_8._fibra.png',
    dbColumn: 'layers_iso_ext_fibre_id',
    alt: 'Asebra avec Attique - 7. fibra.png',
    mime: 'image/png'
  },
  {
    localName: '9. stiropori atikes.png',
    targetName: 'asebra-me-atike_9._stiropori_atikes.png',
    dbColumn: 'layers_terrace_etancheite_epdm_id',
    alt: 'Asebra avec Attique - 9. stiropori atikes.png',
    mime: 'image/png'
  },
  {
    localName: '10. epdm.png',
    targetName: 'asebra-me-atike_10._epdm.png',
    dbColumn: 'layers_etancheite_epdm_id',
    alt: 'Asebra avec Attique - 10. epdm.png',
    mime: 'image/png'
  },
  {
    localName: '11. fasada e bardhe.png',
    targetName: 'asebra-me-atike_11._fasada_e_bardhe.png',
    dbColumn: 'layers_facade_blanche_id',
    alt: 'Asebra avec Attique - 11. fasada e bardhe.png',
    mime: 'image/png'
  },
  {
    localName: '12. fasada arish.png',
    targetName: 'asebra-me-atike_12._fasada_arish.png',
    dbColumn: 'layers_facade_bardage_id',
    alt: 'Asebra avec Attique - 12. fasada arish.png',
    mime: 'image/png'
  },
  {
    localName: '13. dritaret alumin.png',
    targetName: 'asebra-me-atike_13._dritare_alumin.png',
    dbColumn: 'layers_windows_aluminium_id',
    alt: 'Asebra avec Attique - 13. dritaret alumin.png',
    mime: 'image/png'
  },
  {
    localName: '14. dritaret pvc.png',
    targetName: 'asebra-me-atike_14._dritare_pvc.png',
    dbColumn: 'layers_windows_pvc_id',
    alt: 'Asebra avec Attique - 14. dritaret pvc.png',
    mime: 'image/png'
  },
  {
    localName: '4 asebra.jpg',
    targetName: 'asebra-me-atike_default.jpg',
    dbColumn: 'default_image_id',
    alt: 'Asebra avec Attique',
    mime: 'image/jpeg'
  },
  {
    localName: '5 asebra.jpg',
    targetName: 'asebra-me-atike_final.jpg',
    dbColumn: 'final_image_id',
    alt: 'Asebra avec Attique - Rendu Final',
    mime: 'image/jpeg'
  }
];

// Old media records to delete (IDs 174 to 186)
const oldMediaIds = [174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186];

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

  console.log('\n=== PHASE 2: Database Operations (Short Connection Session) ===');

  // Initialize DB Client
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to PostgreSQL database.');

  const uploadedMediaIds = {};

  try {
    // 1. Fetch old media filenames from database for later S3 deletion
    console.log(' - Fetching old media filenames from database...');
    const getOldFilenamesQuery = `SELECT id, filename FROM media WHERE id = ANY($1)`;
    const oldFilesRes = await pgClient.query(getOldFilenamesQuery, [oldMediaIds]);
    const oldFilesList = oldFilesRes.rows;
    console.log(`   Found ${oldFilesList.length} old media records in database.`);

    // 2. Clean up any existing database records for this model to support reruns cleanly
    console.log(' - Cleaning up any existing database records with "asebra-me-atike_" pattern...');
    await pgClient.query(`
      DELETE FROM media_locales 
      WHERE _parent_id IN (
        SELECT id FROM media WHERE filename LIKE 'asebra-me-atike_%'
      )
    `);
    const cleanupRes = await pgClient.query(`
      DELETE FROM media WHERE filename LIKE 'asebra-me-atike_%' RETURNING id
    `);
    console.log(`   Deleted ${cleanupRes.rowCount} previous temporary media records from database.`);

    // 3. Insert new media entries
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

    // 4. Update the houses table record (ID: 7)
    console.log(' - Updating houses table record (ID: 7)...');
    const updateHouseQuery = `
      UPDATE houses
      SET 
        slug = $1,
        category_id = $2,
        default_image_id = $3,
        final_image_id = $4,
        enable_flags_enable_etancheite_terrasse = $5,
        enable_flags_enable_faux_plafond_option = $6,
        layers_background_layer_id = $7,
        layers_construction_layer_id = $8,
        layers_iso_inter_verre_id = $9,
        layers_iso_inter_roche_id = $10,
        layers_iso_inter_bois_id = $11,
        layers_iso_ext_roche_comprimee_id = $12,
        layers_iso_ext_polystyrene_id = $13,
        layers_iso_ext_fibre_id = $14,
        layers_terrace_etancheite_epdm_id = $15,
        layers_etancheite_epdm_id = $16,
        layers_facade_blanche_id = $17,
        layers_facade_bardage_id = $18,
        layers_windows_aluminium_id = $19,
        layers_windows_pvc_id = $20,
        updated_at = $21
      WHERE id = 7
    `;
    await pgClient.query(updateHouseQuery, [
      'asebra-me-atike',                               // slug
      2,                                              // category_id (maison-sans-faitage / toiture-terrasse-avec-etage)
      uploadedMediaIds.default_image_id,              // default_image_id
      uploadedMediaIds.final_image_id,                // final_image_id
      true,                                           // enable_flags_enable_etancheite_terrasse
      true,                                           // enable_flags_enable_faux_plafond_option
      uploadedMediaIds.layers_background_layer_id,
      uploadedMediaIds.layers_construction_layer_id,
      uploadedMediaIds.layers_iso_inter_verre_id,
      uploadedMediaIds.layers_iso_inter_roche_id,
      uploadedMediaIds.layers_iso_inter_bois_id,
      uploadedMediaIds.layers_iso_ext_roche_comprimee_id,
      uploadedMediaIds.layers_iso_ext_polystyrene_id,
      uploadedMediaIds.layers_iso_ext_fibre_id,
      uploadedMediaIds.layers_terrace_etancheite_epdm_id,
      uploadedMediaIds.layers_etancheite_epdm_id,
      uploadedMediaIds.layers_facade_blanche_id,
      uploadedMediaIds.layers_facade_bardage_id,
      uploadedMediaIds.layers_windows_aluminium_id,
      uploadedMediaIds.layers_windows_pvc_id,
      new Date()
    ]);
    console.log('   House ID 7 successfully updated.');

    // 5. Update houses_locales table record
    console.log(' - Updating houses_locales table record for ID 7...');
    const updateHouseLocQuery = `
      UPDATE houses_locales
      SET
        title = $1,
        subheading = $2,
        description = $3,
        structure_info = $4
      WHERE _parent_id = 7 AND _locale = 'fr'
    `;
    
    const frenchDescription = `Le modèle Asebra avec Attique séduit par son design contemporain, ses volumes harmonieux et sa structure robuste en ossature bois à haute performance thermique (conforme RE2020). Cette maison modulaire haut de gamme propose un toit plat avec attique, créant des lignes géométriques épurées qui s'intègrent à la perfection dans les environnements urbains et résidentiels modernes. Entièrement personnalisable, elle allie confort et élégance architecturale.`;
    
    const frenchSubheading = `Découvrez le modèle Asebra avec Attique, une réalisation modulaire d'exception dotée d'une architecture plate contemporaine et d'une structure bois performante.`;
    
    const frenchStructureInfo = `Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle de type terrasse avec attique. Le prix inclut le transport et le montage sur site sous garantie décennale.`;

    await pgClient.query(updateHouseLocQuery, [
      'Asebra avec Attique',
      frenchSubheading,
      frenchDescription,
      frenchStructureInfo
    ]);
    console.log('   House localization updated.');

    // 6. Delete old media records from database
    console.log(' - Deleting old media records from database...');
    await pgClient.query(`DELETE FROM media_locales WHERE _parent_id = ANY($1)`, [oldMediaIds]);
    await pgClient.query(`DELETE FROM media WHERE id = ANY($1)`, [oldMediaIds]);
    console.log('   Old media records deleted from database.');

    // Close the PG client cleanly
    await pgClient.end();
    console.log('PostgreSQL connection closed.');

    console.log('\n=== PHASE 3: S3 Deletion of Old Assets ===');
    for (const oldFile of oldFilesList) {
      try {
        console.log(`Deleting old file '${oldFile.filename}' from S3 bucket '${process.env.S3_BUCKET}'...`);
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: oldFile.filename
        }));
        console.log(' - S3 delete complete.');
      } catch (s3Err) {
        console.error(` - Failed to delete S3 key '${oldFile.filename}':`, s3Err.message);
      }
    }

    console.log('\nAll uploads, DB updates, and asset cleanups completed successfully!');

  } catch (dbErr) {
    console.error('Database phase failed, closing connection:', dbErr);
    try {
      await pgClient.end();
    } catch {}
    throw dbErr;
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
