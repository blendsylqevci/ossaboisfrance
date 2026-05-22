const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

// Load environment variables from .env
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
    console.log('Loaded env variables.');
  }
} catch (err) {
  console.warn('Could not read .env:', err.message);
}

const SOURCE_PATH = '/Users/blendsylqevci/.gemini/antigravity/brain/55ecb8d8-bc4f-4b07-a81e-c3c123ba4a60/media__1779442885191.png';
const TARGET_PATH = '/Users/blendsylqevci/Desktop/Projects/ossaboisfrance/public/images/houses/Elegance Comble/7. lesh druri ne kulm.png';
const S3_KEY = 'elegance-comble_7._lesh_druri_ne_kulm.png';
const MEDIA_ID = 322;

async function main() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Source file not found: ${SOURCE_PATH}`);
  }

  // 1. Copy the file locally
  console.log(`Copying source file to: ${TARGET_PATH}...`);
  fs.copyFileSync(SOURCE_PATH, TARGET_PATH);
  console.log('Local copy complete.');

  // 2. Read new file metadata using sharp
  const fileStats = fs.statSync(TARGET_PATH);
  const filesize = fileStats.size;
  const imgMetadata = await sharp(TARGET_PATH).metadata();
  const width = imgMetadata.width;
  const height = imgMetadata.height;
  console.log(`New metadata - size: ${filesize} bytes, dimensions: ${width}x${height}`);

  // 3. Upload to S3
  console.log('Initializing S3 client...');
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const fileBuffer = fs.readFileSync(TARGET_PATH);
  console.log(`Uploading to S3 bucket '${process.env.S3_BUCKET}' as key '${S3_KEY}'...`);
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: S3_KEY,
    Body: fileBuffer,
    ContentType: 'image/png',
  }));
  console.log('S3 upload complete.');

  // 4. Update the DB
  console.log('Connecting to database...');
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected.');

  try {
    console.log(`Updating database media ID: ${MEDIA_ID}...`);
    const now = new Date();
    await pgClient.query(`
      UPDATE media
      SET filesize = $1,
          width = $2,
          height = $3,
          updated_at = $4
      WHERE id = $5
    `, [filesize, width, height, now, MEDIA_ID]);
    console.log('Database update complete.');
  } finally {
    await pgClient.end();
    console.log('Database connection closed.');
  }
}

main().catch((err) => {
  console.error('Update script failed:', err);
  process.exit(1);
});
