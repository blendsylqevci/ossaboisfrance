const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

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
      MaxKeys: 5,
    }));
    console.log("S3 Connection Successful. Found objects:", data.Contents);
  } catch (err) {
    console.error("S3 Error:", err);
  }
}

main();
