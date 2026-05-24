const fs = require('fs');
const path = require('path');
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');

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
  }
} catch (err) {
  console.error(err);
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

async function checkKey(key) {
  try {
    const res = await s3.send(new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    }));
    return { key, exists: true, size: res.ContentLength, type: res.ContentType };
  } catch (err) {
    return { key, exists: false, error: err.message };
  }
}

async function main() {
  const keys = [
    'asebra-me-atike_default.jpg',
    'asebra-me-atike_final.jpg',
    'cotage-atike_default.jpg',
    'cotage-atike_final.jpg',
    'elegance-comble_default.jpg',
    'elegance-comble_final.jpg'
  ];
  
  console.log(`Checking S3 bucket: ${process.env.S3_BUCKET}`);
  for (const key of keys) {
    const result = await checkKey(key);
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
