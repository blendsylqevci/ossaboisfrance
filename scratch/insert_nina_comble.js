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

const IMAGES_DIR = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/nina comble';

const fileMappings = [
  {
    localName: '1. prapavija.png',
    targetName: 'nina-comble_1._prapavija.png',
    dbColumn: 'layers_background_layer_id',
    alt: 'Nina Comble - Arrière-plan',
    mime: 'image/png'
  },
  {
    localName: '2. kons.png',
    targetName: 'nina-comble_2._kons.png',
    dbColumn: 'layers_construction_layer_id',
    alt: 'Nina Comble - Structure de construction',
    mime: 'image/png'
  },
  {
    localName: '3. lesh guri.png',
    targetName: 'nina-comble_3._lesh_guri.png',
    dbColumn: 'layers_iso_inter_roche_id',
    alt: 'Nina Comble - Isolation intermédiaire laine de roche',
    mime: 'image/png'
  },
  {
    localName: '4. lesh druri.png',
    targetName: 'nina-comble_4._lesh_druri.png',
    dbColumn: 'layers_iso_inter_bois_id',
    alt: 'Nina Comble - Isolation intermédiaire laine de bois',
    mime: 'image/png'
  },
  {
    localName: '5. lesh xhami.png',
    targetName: 'nina-comble_5._lesh_xhami.png',
    dbColumn: 'layers_iso_inter_verre_id',
    alt: 'Nina Comble - Isolation intermédiaire laine de verre',
    mime: 'image/png'
  },
  {
    localName: '6. lesh guri ne kulm.png',
    targetName: 'nina-comble_6._lesh_guri_ne_kulm.png',
    dbColumn: 'layers_roof_roche_id',
    alt: 'Nina Comble - Isolation toiture laine de roche',
    mime: 'image/png'
  },
  {
    localName: '7. lesh druri.png',
    targetName: 'nina-comble_7._lesh_druri_ne_kulm.png',
    dbColumn: 'layers_roof_bois_id',
    alt: 'Nina Comble - Isolation toiture laine de bois',
    mime: 'image/png'
  },
  {
    localName: '8. lesh xhami.png',
    targetName: 'nina-comble_8._lesh_xhami_ne_kulm.png',
    dbColumn: 'layers_roof_verre_id',
    alt: 'Nina Comble - Isolation toiture laine de verre',
    mime: 'image/png'
  },
  {
    localName: '9. stiropori.png',
    targetName: 'nina-comble_9._stiropori.png',
    dbColumn: 'layers_iso_ext_polystyrene_id',
    alt: 'Nina Comble - Isolation extérieure polystyrène',
    mime: 'image/png'
  },
  {
    localName: '10 lesh guri jashte.png',
    targetName: 'nina-comble_10._lesh_guri_jashte.png',
    dbColumn: 'layers_iso_ext_roche_comprimee_id',
    alt: 'Nina Comble - Isolation extérieure laine de roche',
    mime: 'image/png'
  },
  {
    localName: '11. fibra.png',
    targetName: 'nina-comble_11._fibra.png',
    dbColumn: 'layers_iso_ext_fibre_id',
    alt: 'Nina Comble - Isolation extérieure fibre de bois',
    mime: 'image/png'
  },
  {
    localName: '12. folja dhe listelat.png',
    targetName: 'nina-comble_12._folja_dhe_listelat.png',
    dbColumn: 'layers_couverture_pare_pluie_lattage_id',
    alt: 'Nina Comble - Pare-pluie et lattage',
    mime: 'image/png'
  },
  {
    localName: '13. fasada e bardhe.png',
    targetName: 'nina-comble_13._fasada_e_bardhe.png',
    dbColumn: 'layers_facade_blanche_id',
    alt: 'Nina Comble - Façade enduit blanc',
    mime: 'image/png'
  },
  {
    localName: '14. fasada arish.png',
    targetName: 'nina-comble_14._fasada_arish.png',
    dbColumn: 'layers_facade_bardage_id',
    alt: 'Nina Comble - Façade bardage mélèze',
    mime: 'image/png'
  },
  {
    localName: '15. dritaret alumin.png',
    targetName: 'nina-comble_15._dritaret_alumin.png',
    dbColumn: 'layers_windows_aluminium_id',
    alt: 'Nina Comble - Menuiseries aluminium',
    mime: 'image/png'
  },
  {
    localName: '16. dritaret pvc.png',
    targetName: 'nina-comble_16._dritaret_pvc.png',
    dbColumn: 'layers_windows_pvc_id',
    alt: 'Nina Comble - Menuiseries PVC',
    mime: 'image/png'
  },
  {
    localName: '17. qeremidet.png',
    targetName: 'nina-comble_17._qeremidet.png',
    dbColumn: 'layers_couverture_tuiles_gouttieres_id',
    alt: 'Nina Comble - Couverture tuiles et gouttières',
    mime: 'image/png'
  },
  {
    localName: '18 llamarina.png',
    targetName: 'nina-comble_18._llamarina.png',
    dbColumn: 'layers_couverture_bac_acier_gouttieres_id',
    alt: 'Nina Comble - Couverture bac acier et gouttières',
    mime: 'image/png'
  },
  {
    localName: '19. lesh guri ne pllake.png',
    targetName: 'nina-comble_19._lesh_guri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_roche_id',
    alt: 'Nina Comble - Isolation faux plafond laine de roche',
    mime: 'image/png'
  },
  {
    localName: '20. lesh druri ne pllake.png',
    targetName: 'nina-comble_20._lesh_druri_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_bois_id',
    alt: 'Nina Comble - Isolation faux plafond laine de bois',
    mime: 'image/png'
  },
  {
    localName: '21. lesh xhami ne pllake.png',
    targetName: 'nina-comble_21._lesh_xhami_ne_pllake.png',
    dbColumn: 'layers_faux_plafond_verre_id',
    alt: 'Nina Comble - Isolation faux plafond laine de verre',
    mime: 'image/png'
  },
  {
    localName: 'nina 7.jpg',
    targetName: 'nina-comble_default.jpg',
    dbColumn: 'default_image_id',
    alt: 'Nina Comble',
    mime: 'image/jpeg'
  },
  {
    localName: 'nina 10.jpg',
    targetName: 'nina-comble_final.jpg',
    dbColumn: 'final_image_id',
    alt: 'Nina Comble - Rendu Final',
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

    // Insert new media entries
    const uploadedMediaIds = {};
    console.log(' - Inserting new media entries into database...');
    for (const data of uploadMetadata) {
      // Check if media already exists
      const checkRes = await pgClient.query('SELECT id FROM media WHERE filename = $1', [data.mapping.targetName]);
      let mediaId;
      if (checkRes.rowCount > 0) {
        mediaId = checkRes.rows[0].id;
        console.log(`   Media already exists: ${data.mapping.targetName} (ID: ${mediaId}). Updating metadata...`);
        
        // Update existing media record to ensure metadata matches
        const updateMediaQuery = `
          UPDATE media
          SET updated_at = $1, filesize = $2, width = $3, height = $4
          WHERE id = $5
        `;
        await pgClient.query(updateMediaQuery, [new Date(), data.filesize, data.width, data.height, mediaId]);

        // Update alt text in locales if it exists, or insert it
        const checkLocRes = await pgClient.query('SELECT id FROM media_locales WHERE _parent_id = $1 AND _locale = $2', [mediaId, 'fr']);
        if (checkLocRes.rowCount > 0) {
          await pgClient.query('UPDATE media_locales SET alt = $1 WHERE id = $2', [data.mapping.alt, checkLocRes.rows[0].id]);
        } else {
          await pgClient.query('INSERT INTO media_locales (alt, _locale, _parent_id) VALUES ($1, $2, $3)', [data.mapping.alt, 'fr', mediaId]);
        }
      } else {
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
        mediaId = mediaRes.rows[0].id;
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
      uploadedMediaIds[data.mapping.dbColumn] = mediaId;
    }

    // Check if house nina-house exists
    const findHouseRes = await pgClient.query("SELECT id FROM houses WHERE slug = 'nina-house'");
    let houseId;

    if (findHouseRes.rowCount > 0) {
      houseId = findHouseRes.rows[0].id;
      console.log(`Found existing house nina-house with ID: ${houseId}. Updating it...`);
      
      const updateHouseQuery = `
        UPDATE houses
        SET
          category_id = $1,
          default_image_id = $2,
          final_image_id = $3,
          price60x160 = $4,
          price60x200 = $5,
          margin_percent = $6,
          enable_flags_enable_roof_option = $7,
          enable_flags_enable_etancheite_option = $8,
          enable_flags_enable_etancheite_terrasse = $9,
          enable_flags_enable_couverture_option = $10,
          enable_flags_enable_faux_plafond_option = $11,
          layers_background_layer_id = $12,
          layers_construction_layer_id = $13,
          layers_iso_inter_roche_id = $14,
          layers_iso_inter_bois_id = $15,
          layers_iso_inter_verre_id = $16,
          layers_roof_roche_id = $17,
          layers_roof_bois_id = $18,
          layers_roof_verre_id = $19,
          layers_iso_ext_polystyrene_id = $20,
          layers_iso_ext_roche_comprimee_id = $21,
          layers_iso_ext_fibre_id = $22,
          layers_couverture_pare_pluie_lattage_id = $23,
          layers_facade_blanche_id = $24,
          layers_facade_bardage_id = $25,
          layers_windows_aluminium_id = $26,
          layers_windows_pvc_id = $27,
          layers_couverture_tuiles_gouttieres_id = $28,
          layers_couverture_bac_acier_gouttieres_id = $29,
          layers_faux_plafond_roche_id = $30,
          layers_faux_plafond_bois_id = $31,
          layers_faux_plafond_verre_id = $32,
          updated_at = $33
        WHERE id = $34
      `;

      await pgClient.query(updateHouseQuery, [
        4, // category_id (Comble)
        uploadedMediaIds['default_image_id'],
        uploadedMediaIds['final_image_id'],
        26863, // price60x160
        30363, // price60x200
        40, // margin_percent
        true, // enable_flags_enable_roof_option
        true, // enable_flags_enable_etancheite_option
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
        uploadedMediaIds['layers_couverture_tuiles_gouttieres_id'],
        uploadedMediaIds['layers_couverture_bac_acier_gouttieres_id'],
        uploadedMediaIds['layers_faux_plafond_roche_id'],
        uploadedMediaIds['layers_faux_plafond_bois_id'],
        uploadedMediaIds['layers_faux_plafond_verre_id'],
        new Date(),
        houseId
      ]);
      console.log(`Successfully updated house with ID: ${houseId}`);

      // Delete old locales
      await pgClient.query("DELETE FROM houses_locales WHERE _parent_id = $1", [houseId]);
    } else {
      console.log('House nina-house not found. Creating a new record...');
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
      const insertRes = await pgClient.query(insertHouseQuery, [
        'nina-house', // slug
        4, // category_id (Comble)
        uploadedMediaIds['default_image_id'],
        uploadedMediaIds['final_image_id'],
        26863, // price60x160
        30363, // price60x200
        40, // margin_percent
        true, // enable_flags_enable_roof_option
        true, // enable_flags_enable_etancheite_option
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
        uploadedMediaIds['layers_couverture_tuiles_gouttieres_id'],
        uploadedMediaIds['layers_couverture_bac_acier_gouttieres_id'],
        uploadedMediaIds['layers_faux_plafond_roche_id'],
        uploadedMediaIds['layers_faux_plafond_bois_id'],
        uploadedMediaIds['layers_faux_plafond_verre_id'],
        now,
        now
      ]);
      houseId = insertRes.rows[0].id;
      console.log(`Successfully created house with ID: ${houseId}`);
    }

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
    
    const frenchDescription = `Le modèle Nina Comble allie charme traditionnel et performance énergétique. Avec sa toiture inclinée à forte pente abritant des combles aménageables et équipée de fenêtres de toit, il offre une flexibilité d'aménagement optimale pour s'adapter à l'évolution de votre famille. Sa structure robuste en ossature bois à haute efficacité thermique (conforme RE2020) garantit un confort de vie inégalé en toutes saisons.`;
    
    const frenchSubheading = `Découvrez Nina comble, une maison modulaire à combles aménageables alliant élégance et volumes généreux.`;
    
    const frenchStructureInfo = `Structure en ossature bois réalisée selon les normes en vigueur, contreventée par panneaux OSB 12 mm assurant rigidité et stabilité de l'ensemble. Comprend les murs porteurs, murs de séparation et charpente bois de type combles aménageables. Le prix inclut le transport et le montage sur site sous garantie décennale.`;

    await pgClient.query(insertHouseLocQuery, [
      'Nina comble',
      frenchSubheading,
      frenchDescription,
      frenchStructureInfo,
      'fr',
      houseId
    ]);
    console.log('House localization inserted successfully.');

    const newMediaIds = Object.values(uploadedMediaIds);
    if (newMediaIds.length > 0) {
      console.log(' - Cleaning up old nina-comble media from DB (excluding new ones)...');
      await pgClient.query(`
        DELETE FROM media_locales 
        WHERE _parent_id IN (
          SELECT id FROM media 
          WHERE filename LIKE 'nina-comble\\_%' ESCAPE '\\'
            AND id NOT IN (${newMediaIds.join(',')})
        )
      `);
      const cleanupRes = await pgClient.query(`
        DELETE FROM media 
        WHERE filename LIKE 'nina-comble\\_%' ESCAPE '\\'
          AND id NOT IN (${newMediaIds.join(',')})
      `);
      console.log(`   Deleted ${cleanupRes.rowCount} previous media records.`);
    }

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
