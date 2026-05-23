const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244$$$.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('--- Finding Safe-to-Delete Media ---');

  try {
    // 1. Find all foreign keys from "houses" table pointing to "media" table
    const fkQuery = `
      SELECT
        kcu.column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'houses' 
        AND ccu.table_name = 'media';
    `;
    const fkRes = await client.query(fkQuery);
    const houseReferencingCols = fkRes.rows.map(r => r.column_name);
    console.log('Columns in houses table pointing to media:', houseReferencingCols);

    // 2. Build subquery to exclude any media ID referenced by these columns
    const selectClauses = houseReferencingCols.map(col => `SELECT COALESCE("${col}", 0) FROM houses`).join(' UNION ');
    
    // Also include any media referenced in other relationship tables if any exist
    // Let's check if there are other tables referencing media
    const otherFkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name != 'houses'
        AND tc.table_name NOT IN ('media_locales', 'payload_locked_documents_rels')
        AND ccu.table_name = 'media';
    `;
    const otherFkRes = await client.query(otherFkQuery);
    console.log('Other tables pointing to media (excluding media_locales / locks):');
    const otherSelects = [];
    otherFkRes.rows.forEach(r => {
      console.log(`- Table: ${r.table_name}, Column: ${r.column_name}`);
      otherSelects.push(`SELECT COALESCE("${r.column_name}", 0) FROM "${r.table_name}"`);
    });

    const allSelects = [...selectClauses.split(' UNION '), ...otherSelects].join(' UNION ');

    const finalOrphanQuery = `
      SELECT id, filename, filesize 
      FROM media 
      WHERE id NOT IN (${allSelects})
      ORDER BY id ASC
      LIMIT 24;
    `;

    const orphanRes = await client.query(finalOrphanQuery);
    console.log(`\nGenuinely Safe-to-Delete Media files (0 references): ${orphanRes.rows.length}`);
    
    orphanRes.rows.forEach(r => {
      console.log(`- ID: ${r.id}, Filename: ${r.filename}, Size: ${(Number(r.filesize || 0) / 1024).toFixed(1)} KB`);
    });

  } catch (e) {
    console.error('Error finding safe orphans:', e.message);
  }

  await client.end();
}

main().catch(console.error);
