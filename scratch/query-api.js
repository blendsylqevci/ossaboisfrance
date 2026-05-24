const fs = require('fs');
const path = require('path');

async function main() {
  const url = 'http://localhost:3000/api/houses?where[slug][equals]=monna-me-atike&locale=en&depth=1';
  console.log('Fetching', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    fs.writeFileSync(
      path.join(__dirname, '..', 'scratch', 'payload-house-response.json'),
      JSON.stringify(data, null, 2)
    );
    console.log('Saved response to scratch/payload-house-response.json');
    if (data.docs && data.docs.length > 0) {
      console.log('House doc found. Slug:', data.docs[0].slug);
    } else {
      console.log('No house docs returned!');
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main().catch(console.error);
