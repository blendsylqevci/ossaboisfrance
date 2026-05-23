const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244$$$.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('--- Database Media Audit ---');

  // 1. Describe media table columns to find the relationship column
  try {
    const colRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'media';
    `);
    console.log('Media table columns:');
    colRes.rows.forEach(r => {
      console.log(`- ${r.column_name} (${r.data_type})`);
    });
  } catch (e) {
    console.error('Error getting columns:', e.message);
  }

  // 2. Count total media files
  try {
    const countRes = await client.query('SELECT COUNT(*) FROM media;');
    const totalMedia = countRes.rows[0].count;
    console.log(`\nTotal media records in database: ${totalMedia}`);
  } catch (e) {
    console.error('Error counting media:', e.message);
  }

  // 3. Find media records not linked to any house (unlinked/orphan files)
  try {
    // Let's first check if 'house_id' column exists
    const colCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'media' AND column_name = 'house_id';
    `);
    
    let query = '';
    if (colCheck.rows.length > 0) {
      query = 'SELECT id, filename, filesize FROM media WHERE house_id IS NULL;';
    } else {
      query = 'SELECT id, filename, filesize FROM media WHERE house_id IS NULL;';
    }

    const orphanRes = await client.query(query);
    console.log(`\nUnlinked media files (house_id IS NULL): ${orphanRes.rows.length}`);
    
    let totalSize = 0;
    orphanRes.rows.forEach(r => {
      totalSize += Number(r.filesize || 0);
    });
    
    console.log(`Total size of unlinked media: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

    console.log('\nSample unlinked files (first 10):');
    orphanRes.rows.slice(0, 10).forEach(r => {
      console.log(`- ID: ${r.id}, Filename: ${r.filename}, Size: ${(Number(r.filesize || 0) / 1024).toFixed(1)} KB`);
    });

  } catch (e) {
    console.error('Error checking orphans:', e.message);
  }

  await client.end();
}

main().catch(console.error);
