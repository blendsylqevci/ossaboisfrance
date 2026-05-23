const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Manually parse .env file
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found');
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1].trim()] = value;
    }
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const connectionString = env.DATABASE_URI;
  const s3Bucket = env.S3_BUCKET || 'media';
  const s3AccessKeyId = env.S3_ACCESS_KEY_ID;
  const s3SecretAccessKey = env.S3_SECRET_ACCESS_KEY;
  const s3Region = env.S3_REGION || 'eu-central-1';
  const s3Endpoint = env.S3_ENDPOINT || '';

  const writeMode = process.argv.includes('--write');

  console.log(`--- Syncing Supabase storage.objects Metadata (${writeMode ? 'WRITE MODE' : 'DRY RUN'}) ---`);

  const s3Config = {
    credentials: {
      accessKeyId: s3AccessKeyId,
      secretAccessKey: s3SecretAccessKey,
    },
    region: s3Region,
    forcePathStyle: true,
  };
  if (s3Endpoint) {
    s3Config.endpoint = s3Endpoint;
  }
  const s3 = new S3Client(s3Config);

  // 1. List all S3 objects to get actual sizes
  console.log(`Fetching physical sizes of all objects in bucket: ${s3Bucket}...`);
  const s3Sizes = new Map();
  let continuationToken = undefined;

  try {
    do {
      const response = await s3.send(new ListObjectsV2Command({
        Bucket: s3Bucket,
        ContinuationToken: continuationToken,
      }));
      if (response.Contents) {
        response.Contents.forEach(item => {
          s3Sizes.set(item.Key, item.Size);
        });
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    console.log(`Fetched ${s3Sizes.size} physical file sizes from S3.`);
  } catch (err) {
    console.error('Error fetching S3 objects:', err.message);
    return;
  }

  // 2. Query storage.objects metadata
  const client = new Client({ connectionString });
  await client.connect();

  let totalSpaceReduced = 0;
  let objectsUpdated = 0;

  try {
    const res = await client.query(`
      SELECT id, name, metadata 
      FROM storage.objects 
      WHERE bucket_id = $1;
    `, [s3Bucket]);

    console.log(`Auditing ${res.rows.length} records in storage.objects...`);

    for (const row of res.rows) {
      const id = row.id;
      const name = row.name;
      const metadata = row.metadata || {};
      const currentMetaSize = Number(metadata.size || 0);

      if (!s3Sizes.has(name)) {
        console.log(`- [Warning] Object '${name}' exists in DB but not physically in S3.`);
        continue;
      }

      const actualS3Size = s3Sizes.get(name);
      const diff = currentMetaSize - actualS3Size;

      if (diff !== 0) {
        const metaMb = (currentMetaSize / (1024 * 1024)).toFixed(2);
        const actualMb = (actualS3Size / (1024 * 1024)).toFixed(2);
        const diffMb = (diff / (1024 * 1024)).toFixed(2);

        console.log(`- '${name}': Metadata Size = ${metaMb} MB | S3 Size = ${actualMb} MB | Diff = ${diffMb} MB`);

        totalSpaceReduced += diff;
        objectsUpdated++;

        if (writeMode) {
          // Update the metadata JSON in-place in PostgreSQL
          // We set both 'size' and 'contentLength' in the metadata JSONB column
          await client.query(`
            UPDATE storage.objects 
            SET metadata = jsonb_set(
              jsonb_set(metadata, '{size}', $1::text::jsonb),
              '{contentLength}', $1::text::jsonb
            )
            WHERE id = $2;
          `, [String(actualS3Size), id]);
        }
      }
    }

    console.log(`\nSynchronization Finished!`);
    console.log(`Objects needing update: ${objectsUpdated}`);
    console.log(`Total metadata size reduction: ${(totalSpaceReduced / (1024 * 1024)).toFixed(2)} MB`);

  } catch (err) {
    console.error('Error during database update:', err.message);
  }

  await client.end();
}

main().catch(console.error);
