const { getPayload } = require('payload');
const config = require('../payload.config').default;

async function test() {
  try {
    console.log("Initializing Payload...");
    const payload = await getPayload({ config });
    console.log("Fetching global 'house-options'...");
    const res = await payload.findGlobal({
      slug: 'house-options',
      depth: 0,
    });
    console.log("Successfully fetched global options:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error fetching global options:", err);
  }
  process.exit(0);
}

test();
