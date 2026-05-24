const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// Load environment variables manually
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
    console.log('Loaded env variables from .env.');
  }
} catch (err) {
  console.warn('Warning: Could not read .env file:', err.message);
}

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const jobs = [
  {
    house: 'Asebra avec Attique',
    mediaId: 294,
    s3Key: 'asebra-me-atike_default.jpg',
    localPath: 'public/images/houses/asebra me atike/4 asebra.jpg'
  },
  {
    house: 'Asebra avec Attique',
    mediaId: 295,
    s3Key: 'asebra-me-atike_final.jpg',
    localPath: 'public/images/houses/asebra me atike/5 asebra.jpg'
  },
  {
    house: 'Cotage Toiture Terrasse',
    mediaId: 525,
    s3Key: 'cotage-atike_default.jpg',
    localPath: 'public/images/houses/cotage me atike/4 cottage.jpg'
  },
  {
    house: 'Cotage Toiture Terrasse',
    mediaId: 526,
    s3Key: 'cotage-atike_final.jpg',
    localPath: 'public/images/houses/cotage me atike/5 cottage.jpg'
  },
  {
    house: 'Elegance Comble',
    mediaId: 337,
    s3Key: 'elegance-comble_default.jpg',
    localPath: 'public/images/houses/Elegance Comble/elegance comble 5.jpg'
  },
  {
    house: 'Elegance Comble',
    mediaId: 338,
    s3Key: 'elegance-comble_final.jpg',
    localPath: 'public/images/houses/Elegance Comble/elegance comble 7.jpg'
  }
];

async function main() {
  console.log('=== STARTING REPAIR COMPARISON IMAGES ===\n');

  // Verify all local files exist and get metadata first
  const fileDetails = [];
  for (const job of jobs) {
    const fullPath = path.join(__dirname, '..', job.localPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Local file not found for ${job.house}: ${fullPath}`);
    }
    const stats = fs.statSync(fullPath);
    const size = stats.size;
    const metadata = await sharp(fullPath).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    console.log(`Verified local file: ${job.localPath}`);
    console.log(` - Size: ${size} bytes | Dimensions: ${width}x${height}`);
    
    fileDetails.push({
      ...job,
      fullPath,
      size,
      width,
      height
    });
  }

  // Upload to S3
  console.log('\n=== PHASE 1: Uploading correct files to S3 ===');
  for (const detail of fileDetails) {
    const fileBuffer = fs.readFileSync(detail.fullPath);
    console.log(`Uploading ${detail.localPath} to S3 bucket '${process.env.S3_BUCKET}' as key '${detail.s3Key}'...`);
    const start = Date.now();
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: detail.s3Key,
      Body: fileBuffer,
      ContentType: 'image/jpeg'
    }));
    console.log(` - S3 upload complete in ${((Date.now() - start)/1000).toFixed(1)}s`);
  }

  // Update Database
  console.log('\n=== PHASE 2: Updating Database Metadata ===');
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to PostgreSQL.');

  try {
    await pgClient.query('BEGIN');
    for (const detail of fileDetails) {
      console.log(`Updating media ID ${detail.mediaId} (${detail.s3Key}) in database...`);
      await pgClient.query(`
        UPDATE media
        SET 
          filesize = $1,
          width = $2,
          height = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [String(detail.size), detail.width, detail.height, detail.mediaId]);
      console.log(` - Updated ID ${detail.mediaId} metadata to size=${detail.size}, dim=${detail.width}x${detail.height}`);
    }
    await pgClient.query('COMMIT');
    console.log('\nDatabase transaction successfully committed.');
  } catch (dbErr) {
    await pgClient.query('ROLLBACK');
    console.error('Database transaction failed, rolling back:', dbErr);
    throw dbErr;
  } finally {
    await pgClient.end();
    console.log('Database connection closed.');
  }

  console.log('\n=== REPAIR SUCCESSFULLY COMPLETED! ===');
}

main().catch((err) => {
  console.error('\nError running repair script:', err);
  process.exit(1);
});
