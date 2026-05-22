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

const IMAGES_DIR = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/mountain valley villa comble';

const fileMappings = [
  {
    localName: '1. prapavija.png',
    targetName: 'mountain-valley-villa-comble_1._prapavija.png',
    dbColumn: 'layers_background_layer_id',
    alt: 'Mountain Valley Villa Comble - Arrière-plan',
    mime: 'image/png'
  },
  {
    localName: '2. kons.png',
    targetName: 'mountain-valley-villa-comble_2._kons.png',
    dbColumn: 'layers_construction_layer_id',
    alt: 'Mountain Valley Villa Comble - Structure de construction',
    mime: 'image/png'
  },
  {
    localName: '3. lesh guri.png',
    targetName: 'mountain-valley-villa-comble_3._lesh_guri.png',
    dbColumn: 'layers_iso_inter_roche_id',
    alt: 'Mountain Valley Villa Comble - Isolation intermédiaire laine de roche',
    mime: 'image/png'
  },
  {
    localName: '4. lesh druri.png',
    targetName: 'mountain-valley-villa-comble_4._lesh_druri.png',
    dbColumn: 'layers_iso_inter_bois_id',
    alt: 'Mountain Valley Villa Comble - Isolation intermédiaire laine de bois',
    mime: 'image/png'
  },
  {
    localName: '5. lesh xhami.png',
    targetName: 'mountain-valley-villa-comble_5._lesh_xhami.png',
    dbColumn: 'layers_iso_inter_verre_id',
    alt: 'Mountain Valley Villa Comble - Isolation intermédiaire laine de verre',
    mime: 'image/png'
  },
  {
    localName: '6. lesh guri ne kulm.png',
    targetName: 'mountain-valley-villa-comble_6._lesh_guri_ne_kulm.png',
    dbColumn: 'layers_roof_roche_id',
    alt: 'Mountain Valley Villa Comble - Isolation toiture laine de roche',
    mime: 'image/png'
  },
  {
    localName: '7. lesh druri.png',
    targetName: 'mountain-valley-villa-comble_7._lesh_druri_ne_kulm.png',
    dbColumn: 'layers_roof_bois_id',
    alt: 'Mountain Valley Villa Comble - Isolation toiture laine de bois',
    mime: 'image/png'
  },
  {
    localName: '8. lesh xhami.png',
    targetName: 'mountain-valley-villa-comble_8._lesh_xhami_ne_kulm.png',
    dbColumn: 'layers_roof_verre_id',
    alt: 'Mountain Valley Villa Comble - Isolation toiture laine de verre',
    mime: 'image/png'
  },
  {
    localName: '9. stiropori.png',
    targetName: 'mountain-valley-villa-comble_9._stiropori.png',
    dbColumn: 'layers_iso_ext_polystyrene_id',
    alt: 'Mountain Valley Villa Comble - Isolation extérieure polystyrène',
    mime: 'image/png'
  },
  {
    localName: '10. lesh guri jashte.png',
    targetName: 'mountain-valley-villa-comble_10._lesh_guri_jashte.png',
    dbColumn: 'layers_iso_ext_roche_comprimee_id',
    alt: 'Mountain Valley Villa Comble - Isolation extérieure laine de roche',
    mime: 'image/png'
  },
  {
    localName: '11. fibra.png',
    targetName: 'mountain-valley-villa-comble_11._fibra.png',
    dbColumn: 'layers_iso_ext_fibre_id',
    alt: 'Mountain Valley Villa Comble - Isolation extérieure fibre de bois',
    mime: 'image/png'
  },
  {
    localName: '12. folia dhe listelat.png',
    targetName: 'mountain-valley-villa-comble_12._folia_dhe_listelat.png',
    dbColumn: 'layers_couverture_pare_pluie_lattage_id',
    alt: 'Mountain Valley Villa Comble - Pare-pluie et lattage',
    mime: 'image/png'
  },
  {
    localName: '13. fasada e bardhe.png',
    targetName: 'mountain-valley-villa-comble_13._fasada_e_bardhe.png',
    dbColumn: 'layers_facade_blanche_id',
    alt: 'Mountain Valley Villa Comble - Façade enduit blanc',
    mime: 'image/png'
  },
  {
    localName: '14. fasada arish.png',
    targetName: 'mountain-valley-villa-comble_14._fasada_arish.png',
    dbColumn: 'layers_facade_bardage_id',
    alt: 'Mountain Valley Villa Comble - Façade bardage mélèze',
    mime: 'image/png'
  },
  {
    localName: '15. dritaret alumin.png',
    targetName: 'mountain-valley-villa-comble_15._dritaret_alumin.png',
    dbColumn: 'layers_windows_aluminium_id',
    alt: 'Mountain Valley Villa Comble - Menuiseries aluminium',
    mime: 'image/png'
  },
  {
    localName: '16. dritaret pvc.png',
    targetName: 'mountain-valley-villa-comble_16._dritaret_pvc.png',
    dbColumn: 'layers_windows_pvc_id',
    alt: 'Mountain Valley Villa Comble - Menuiseries PVC',
    mime: 'image/png'
  },
  {
    localName: '17. llamarina.png',
    targetName: 'mountain-valley-villa-comble_17._llamarina.png',
    dbColumn: 'layers_couverture_bac_acier_gouttieres_id',
    alt: 'Mountain Valley Villa Comble - Couverture bac acier et gouttières',
    mime: 'image/png'
  },
  {
    localName: '18. lesh guri ne pllake.png',
    targetName: 'mountain-valley-villa-comble_18._lesh_guri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_roche_id',
    alt: 'Mountain Valley Villa Comble - Isolation faux plafond laine de roche',
    mime: 'image/png'
  },
  {
    localName: '19. lesh druri ne pllake.png',
    targetName: 'mountain-valley-villa-comble_19._lesh_druri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_bois_id',
    alt: 'Mountain Valley Villa Comble - Isolation faux plafond laine de bois',
    mime: 'image/png'
  },
  {
    localName: '20. lesh xhami ne pllake.png',
    targetName: 'mountain-valley-villa-comble_20._lesh_xhami_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_verre_id',
    alt: 'Mountain Valley Villa Comble - Isolation faux plafond laine de verre',
    mime: 'image/png'
  },
  {
    localName: 'Mountain Valley Villa 7.jpg',
    targetName: 'mountain-valley-villa-comble_default.jpg',
    dbColumn: 'default_image_id',
    alt: 'Mountain Valley Villa Comble',
    mime: 'image/jpeg'
  },
  {
    localName: 'Mountain Valley Villa 10.jpg',
    targetName: 'mountain-valley-villa-comble_final.jpg',
    dbColumn: 'final_image_id',
    alt: 'Mountain Valley Villa Comble - Rendu Final',
    mime: 'image/jpeg'
  }
];

async function main() {
  console.log('=== PHASE 1: S3 Uploads (NO DB Connection Open) ===');

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
    const fileStats = fs.statSync(localFilePath);
    const filesize = fileStats.size;
    const imgMetadata = await sharp(localFilePath).metadata();
    const width = imgMetadata.width;
    const height = imgMetadata.height;

    console.log(` - File size: ${filesize} bytes`);
    console.log(` - Dimensions: ${width}x${height}`);

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

  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to PostgreSQL database.');

  try {
    await pgClient.query('BEGIN');

    // Clean up existing house row with slug 'mountain-valley-villa-comble' if exists to prevent duplicates
    console.log(' - Cleaning up old mountain-valley-villa-comble references if any...');
    
    const findHouseRes = await pgClient.query("SELECT id FROM houses WHERE slug = 'mountain-valley-villa-comble'");
    if (findHouseRes.rowCount > 0) {
      const oldHouseId = findHouseRes.rows[0].id;
      console.log(`   Found old house ID: ${oldHouseId}, resetting media references...`);
      await pgClient.query(`
        UPDATE houses
        SET 
          default_image_id = 88,
          final_image_id = 88,
          layers_background_layer_id = 88,
          layers_construction_layer_id = 88,
          layers_iso_inter_roche_id = null,
          layers_iso_inter_bois_id = null,
          layers_iso_inter_verre_id = null,
          layers_roof_roche_id = null,
          layers_roof_bois_id = null,
          layers_roof_verre_id = null,
          layers_iso_ext_polystyrene_id = null,
          layers_iso_ext_roche_comprimee_id = null,
          layers_iso_ext_fibre_id = null,
          layers_couverture_pare_pluie_lattage_id = null,
          layers_facade_blanche_id = null,
          layers_facade_bardage_id = null,
          layers_windows_aluminium_id = null,
          layers_windows_pvc_id = null,
          layers_couverture_tuiles_gouttieres_id = null,
          layers_couverture_bac_acier_gouttieres_id = null,
          layers_faux_plafond_roche_id = null,
          layers_faux_plafond_bois_id = null,
          layers_faux_plafond_verre_id = null
        WHERE id = $1
      `, [oldHouseId]);
      
      await pgClient.query("DELETE FROM houses_locales WHERE _parent_id = $1", [oldHouseId]);
      await pgClient.query("DELETE FROM houses WHERE id = $1", [oldHouseId]);
      console.log(`   Deleted old house record and its locales.`);
    }

    console.log(' - Cleaning up old mountain-valley-villa-comble media from DB...');
    await pgClient.query(`
      DELETE FROM media_locales 
      WHERE _parent_id IN (
        SELECT id FROM media WHERE filename LIKE 'mountain-valley-villa-comble\\_%' ESCAPE '\\'
      )
    `);
    const cleanupRes = await pgClient.query(`
      DELETE FROM media WHERE filename LIKE 'mountain-valley-villa-comble\\_%' ESCAPE '\\' RETURNING id
    `);
    console.log(`   Deleted ${cleanupRes.rowCount} previous media records.`);

    // Insert new media entries
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

      const mediaLocQuery = `
        INSERT INTO media_locales (
          alt, _locale, _parent_id
        ) VALUES (
          $1, $2, $3
        )
      `;
      await pgClient.query(mediaLocQuery, [data.mapping.alt, 'fr', mediaId]);
    }

    // Insert new house record in houses
    console.log(' - Inserting house mountain-valley-villa-comble in houses table...');
    const insertHouseQuery = `
      INSERT INTO houses (
        slug,
        category_id,
        default_image_id,
        final_image_id,
        price60x160,
        price60x200,
        margin_percent,
        enable_flags_enable_roof_option,
        enable_flags_enable_etancheite_option,
        enable_flags_enable_etancheite_terrasse,
        enable_flags_enable_couverture_option,
        enable_flags_enable_faux_plafond_option,
        layers_background_layer_id,
        layers_construction_layer_id,
        layers_iso_inter_roche_id,
        layers_iso_inter_bois_id,
        layers_iso_inter_verre_id,
        layers_roof_roche_id,
        layers_roof_bois_id,
        layers_roof_verre_id,
        layers_iso_ext_polystyrene_id,
        layers_iso_ext_roche_comprimee_id,
        layers_iso_ext_fibre_id,
        layers_couverture_pare_pluie_lattage_id,
        layers_facade_blanche_id,
        layers_facade_bardage_id,
        layers_windows_aluminium_id,
        layers_windows_pvc_id,
        layers_couverture_tuiles_gouttieres_id,
        layers_couverture_bac_acier_gouttieres_id,
        layers_faux_plafond_roche_id,
        layers_faux_plafond_bois_id,
        layers_faux_plafond_verre_id,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35
      ) RETURNING id
    `;

    const now = new Date();
    const houseRes = await pgClient.query(insertHouseQuery, [
      'mountain-valley-villa-comble', // slug
      4, // category_id (Comble)
      uploadedMediaIds['default_image_id'],
      uploadedMediaIds['final_image_id'],
      1, // price60x160
      1, // price60x200
      40, // margin_percent
      true, // enable_flags_enable_roof_option
      false, // enable_flags_enable_etancheite_option
      false, // enable_flags_enable_etancheite_terrasse
      true, // enable_flags_enable_couverture_option
      true, // enable_flags_enable_faux_plafond_option
      uploadedMediaIds['layers_background_layer_id'],
      uploadedMediaIds['layers_construction_layer_id'],
      uploadedMediaIds['layers_iso_inter_roche_id'],
      uploadedMediaIds['layers_iso_inter_bois_id'],
      uploadedMediaIds['layers_iso_inter_verre_id'],
      uploadedMediaIds['layers_roof_roche_id'],
      uploadedMediaIds['layers_roof_bois_id'],
      uploadedMediaIds['layers_roof_verre_id'],
      uploadedMediaIds['layers_iso_ext_polystyrene_id'],
      uploadedMediaIds['layers_iso_ext_roche_comprimee_id'],
      uploadedMediaIds['layers_iso_ext_fibre_id'],
      uploadedMediaIds['layers_couverture_pare_pluie_lattage_id'],
      uploadedMediaIds['layers_facade_blanche_id'],
      uploadedMediaIds['layers_facade_bardage_id'],
      uploadedMediaIds['layers_windows_aluminium_id'],
      uploadedMediaIds['layers_windows_pvc_id'],
      null, // layers_couverture_tuiles_gouttieres_id (null since no tiles image exists)
      uploadedMediaIds['layers_couverture_bac_acier_gouttieres_id'],
      uploadedMediaIds['layers_faux_plafond_roche_id'],
      uploadedMediaIds['layers_faux_plafond_bois_id'],
      uploadedMediaIds['layers_faux_plafond_verre_id'],
      now,
      now
    ]);
    const newHouseId = houseRes.rows[0].id;
    console.log(`Successfully inserted house mountain-valley-villa-comble with ID: ${newHouseId}`);

    // Insert houses_locales row
    console.log(' - Inserting houses_locales record...');
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
    
    const frenchDescription = `Le modèle Mountain Valley Villa Comble allie charme traditionnel et performance énergétique. Avec sa toiture à forte pente abritant des combles aménageables, il offre une flexibilité d'aménagement optimale pour s'adapter à l'évolution de votre famille. Sa structure robuste en ossature bois à haute efficacité thermique (conforme RE2020) garantit un confort de vie inégalé en toutes saisons.`;
    
    const frenchSubheading = `Découvrez Mountain Valley Villa Comble, un modèle de maison d'exception à combles aménageables avec une structure bois performante.`;
    
    const frenchStructureInfo = `Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente bois de type combles aménageables. Le prix inclut le transport et le montage sur site sous garantie décennale.`;

    await pgClient.query(insertHouseLocQuery, [
      'Mountain valley villa comble',
      frenchSubheading,
      frenchDescription,
      frenchStructureInfo,
      'fr',
      newHouseId
    ]);
    console.log('House localization inserted successfully.');

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
