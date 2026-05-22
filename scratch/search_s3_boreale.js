const fs = require('fs');
const path = require('path');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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

async function main() {
  const s3 = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  try {
    const data = await s3.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
    }));
    
    if (data.Contents) {
      const borealeFiles = data.Contents.filter(item => item.Key.toLowerCase().includes('boreale'));
      console.log(`Found ${borealeFiles.length} files matching 'boreale' in S3:`);
      console.log(JSON.stringify(borealeFiles, null, 2));
    } else {
      console.log("No files in S3 bucket.");
    }
  } catch (err) {
    console.error("S3 Error:", err);
  }
}

main();
