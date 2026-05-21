const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('Querying referencing tables for house ID 33...');
  
  // Let's find orders table structure or rows
  try {
    const resOrders = await client.query('SELECT id, customer_name, customer_email, house_id FROM orders WHERE house_id = $1', [33]);
    console.log(`Orders referencing house 33 (${resOrders.rows.length} rows):`);
    resOrders.rows.forEach(r => {
      console.log(`- Order ID: ${r.id}, Name: ${r.customer_name}, Email: ${r.customer_email}`);
    });
  } catch (e) {
    console.error('Error querying orders:', e.message);
  }

  // Let's find lock documents
  try {
    const resLocks = await client.query('SELECT * FROM payload_locked_documents_rels WHERE houses_id = $1', [33]);
    console.log(`\nLocks referencing house 33 (${resLocks.rows.length} rows):`);
    resLocks.rows.forEach(r => {
      console.log(JSON.stringify(r));
    });
  } catch (e) {
    console.error('Error querying locks:', e.message);
  }

  // Let's also find all tables with foreign keys to houses
  try {
    const fkQuery = `
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='houses';
    `;
    const resFk = await client.query(fkQuery);
    console.log('\nForeign key constraints pointing to houses table:');
    resFk.rows.forEach(r => {
      console.log(`- Table: ${r.table_name}, Column: ${r.column_name}`);
    });
  } catch (e) {
    console.error('Error querying FK constraints:', e.message);
  }

  await client.end();
}

main().catch(console.error);
