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
      Prefix: 'calme-me-atike',
    }));
    console.log("S3 Objects with prefix 'calme-me-atike':");
    if (data.Contents) {
      data.Contents.forEach(obj => {
        console.log(`  Key: "${obj.Key}", Size: ${obj.Size}`);
      });
    } else {
      console.log("No objects found.");
    }
  } catch (err) {
    console.error("S3 Error:", err);
  }
}

main();
