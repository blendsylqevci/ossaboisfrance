const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const IMAGES_DIR = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/ambre me atike';

const fileMappings = [
  {
    localName: '1. Prapavija.png',
    targetName: 'ambre-me-atike_1._prapavija.png',
    dbColumn: 'layers_background_layer_id',
    alt: 'Ambre avec Attique - 1. Prapavija.png',
    mime: 'image/png'
  },
  {
    localName: '2. kons.png',
    targetName: 'ambre-me-atike_2._kons.png',
    dbColumn: 'layers_construction_layer_id',
    alt: 'Ambre avec Attique - 2. kons.png',
    mime: 'image/png'
  },
  {
    localName: '3. lesh guri.png',
    targetName: 'ambre-me-atike_3._lesh_guri.png',
    dbColumn: 'layers_iso_inter_roche_id',
    alt: 'Ambre avec Attique - 3. lesh guri.png',
    mime: 'image/png'
  },
  {
    localName: '4. lesh druri.png',
    targetName: 'ambre-me-atike_4._lesh_druri.png',
    dbColumn: 'layers_iso_inter_bois_id',
    alt: 'Ambre avec Attique - 4. lesh druri.png',
    mime: 'image/png'
  },
  {
    localName: '5. lesh xhami.png',
    targetName: 'ambre-me-atike_5._lesh_xhami.png',
    dbColumn: 'layers_iso_inter_verre_id',
    alt: 'Ambre avec Attique - 5. lesh xhami.png',
    mime: 'image/png'
  },
  {
    localName: '6. stiropori.png',
    targetName: 'ambre-me-atike_6._stiropori.png',
    dbColumn: 'layers_iso_ext_polystyrene_id',
    alt: 'Ambre avec Attique - 6. stiropori.png',
    mime: 'image/png'
  },
  {
    localName: '8. lesh guri i jashtem.png',
    targetName: 'ambre-me-atike_7._lesh_guri_jashte.png',
    dbColumn: 'layers_iso_ext_roche_comprimee_id',
    alt: 'Ambre avec Attique - 8. lesh guri i jashtem.png',
    mime: 'image/png'
  },
  {
    localName: '7. fibra.png',
    targetName: 'ambre-me-atike_8._fibra.png',
    dbColumn: 'layers_iso_ext_fibre_id',
    alt: 'Ambre avec Attique - 7. fibra.png',
    mime: 'image/png'
  },
  {
    localName: '9. stiropori.png',
    targetName: 'ambre-me-atike_9._stiropori_atikes.png',
    dbColumn: 'layers_terrace_etancheite_epdm_id',
    alt: 'Ambre avec Attique - 9. stiropori.png',
    mime: 'image/png'
  },
  {
    localName: '10.epdm.png',
    targetName: 'ambre-me-atike_10._epdm.png',
    dbColumn: 'layers_etancheite_epdm_id',
    alt: 'Ambre avec Attique - 10.epdm.png',
    mime: 'image/png'
  },
  {
    localName: '11. fasada e bardhe.png',
    targetName: 'ambre-me-atike_11._fasada_e_bardhe.png',
    dbColumn: 'layers_facade_blanche_id',
    alt: 'Ambre avec Attique - 11. fasada e bardhe.png',
    mime: 'image/png'
  },
  {
    localName: '12. fasada arish.png',
    targetName: 'ambre-me-atike_12._fasada_arish.png',
    dbColumn: 'layers_facade_bardage_id',
    alt: 'Ambre avec Attique - 12. fasada arish.png',
    mime: 'image/png'
  },
  {
    localName: '13. dritaret alumin.png',
    targetName: 'ambre-me-atike_13._dritare_alumin.png',
    dbColumn: 'layers_windows_aluminium_id',
    alt: 'Ambre avec Attique - 13. dritaret alumin.png',
    mime: 'image/png'
  },
  {
    localName: '14 dritaret pvc.png',
    targetName: 'ambre-me-atike_14._dritare_pvc.png',
    dbColumn: 'layers_windows_pvc_id',
    alt: 'Ambre avec Attique - 14 dritaret pvc.png',
    mime: 'image/png'
  },
  {
    localName: '7 ambre.jpg',
    targetName: 'ambre-me-atike_7_AMBRE.jpg',
    dbColumn: 'default_image_id',
    alt: 'Ambre avec Attique',
    mime: 'image/jpeg'
  },
  {
    localName: '10 ambre.jpg',
    targetName: 'ambre-me-atike_10_AMBRE.jpg',
    dbColumn: 'final_image_id',
    alt: 'Ambre avec Attique - Rendu Final',
    mime: 'image/jpeg'
  }
];

async function main() {
  // Initialize clients
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();

  console.log('S3 and Database connected successfully.');

  const uploadedMediaIds = {};

  for (const mapping of fileMappings) {
    const localFilePath = path.join(IMAGES_DIR, mapping.localName);
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found: ${localFilePath}`);
    }

    console.log(`\nProcessing file: ${mapping.localName}`);
    
    // 1. Get image metadata (width, height, size)
    const fileStats = fs.statSync(localFilePath);
    const filesize = fileStats.size;
    const imgMetadata = await sharp(localFilePath).metadata();
    const width = imgMetadata.width;
    const height = imgMetadata.height;
    
    console.log(` - File size: ${filesize} bytes`);
    console.log(` - Dimensions: ${width}x${height}`);

    // 2. Upload file to S3
    const fileBuffer = fs.readFileSync(localFilePath);
    console.log(` - Uploading to S3 bucket '${process.env.S3_BUCKET}' as key '${mapping.targetName}'...`);
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: mapping.targetName,
      Body: fileBuffer,
      ContentType: mapping.mime,
    }));
    console.log('   S3 upload complete.');

    // 3. Insert metadata into media table
    const mediaUrl = `/api/media/file/${encodeURIComponent(mapping.targetName)}`;
    console.log(' - Inserting into media table...');
    const mediaQuery = `
      INSERT INTO media (
        updated_at, created_at, url, filename, mime_type, filesize, width, height, focal_x, focal_y
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING id
    `;
    const now = new Date();
    const mediaRes = await pgClient.query(mediaQuery, [
      now, now, mediaUrl, mapping.targetName, mapping.mime, filesize, width, height, 50, 50
    ]);
    const mediaId = mediaRes.rows[0].id;
    uploadedMediaIds[mapping.dbColumn] = mediaId;
    console.log(`   Media inserted, ID: ${mediaId}`);

    // 4. Insert alt into media_locales table
    console.log(' - Inserting into media_locales table...');
    const mediaLocQuery = `
      INSERT INTO media_locales (
        alt, _locale, _parent_id
      ) VALUES (
        $1, $2, $3
      )
    `;
    await pgClient.query(mediaLocQuery, [mapping.alt, 'fr', mediaId]);
    console.log('   Media locale inserted.');
  }

  // 5. Update the houses table record (ID: 4)
  console.log('\n=== Updating houses table record (ID: 4) ===');
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
    WHERE id = 4
  `;
  await pgClient.query(updateHouseQuery, [
    'ambre-me-atike',                               // slug
    2,                                              // category_id (maison-sans-faitage)
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
  console.log('House record ID 4 updated successfully in houses.');

  // 6. Update the houses_locales table record for _parent_id = 4
  console.log('\n=== Updating houses_locales table record (_parent_id: 4) ===');
  const updateHouseLocQuery = `
    UPDATE houses_locales
    SET
      title = $1,
      subheading = $2,
      description = $3,
      structure_info = $4
    WHERE _parent_id = 4 AND _locale = 'fr'
  `;
  
  const frenchDescription = `Le modèle Ambre avec Attique réunit l'élégance d'une toiture terrasse plate à la fonctionnalité d'un attique moderne. Bâtie sur une structure robuste en ossature bois à haute performance énergétique (conforme RE2020), cette maison modulaire contemporaine offre des volumes intérieurs baignés de lumière grâce à ses larges ouvertures. Entièrement configurable, elle permet d'associer un enduit blanc épuré ou un bardage naturel en mélèze, offrant une intégration architecturale harmonieuse.`;
  
  const frenchSubheading = `Découvrez le modèle Ambre avec Attique, une déclinaison contemporaine dotée d'une architecture à toiture terrasse avec attique et d'une structure bois performante.`;
  
  const frenchStructureInfo = `Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente industrielle de type terrasse avec attique. Le prix inclut le transport et le montage sur site sous garantie décennale.`;

  await pgClient.query(updateHouseLocQuery, [
    'Ambre avec Attique',
    frenchSubheading,
    frenchDescription,
    frenchStructureInfo
  ]);
  console.log('House localization updated successfully in houses_locales.');

  await pgClient.end();
  console.log('\nAll S3 uploads and DB updates completed successfully.');
}

main().catch(async (err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
