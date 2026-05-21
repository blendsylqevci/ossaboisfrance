const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('Clearing all document locks...');
  try {
    const resRel = await client.query('DELETE FROM payload_locked_documents_rels');
    console.log(`Deleted ${resRel.rowCount} rows from payload_locked_documents_rels.`);
  } catch (e) {
    console.error('Error clearing payload_locked_documents_rels:', e.message);
  }

  try {
    const resParent = await client.query('DELETE FROM payload_locked_documents');
    console.log(`Deleted ${resParent.rowCount} rows from payload_locked_documents.`);
  } catch (e) {
    console.error('Error clearing payload_locked_documents:', e.message);
  }

  await client.end();
}

main().catch(console.error);
