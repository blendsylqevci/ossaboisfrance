const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
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
} catch (e) {
  console.error("Could not load .env file:", e.message);
}

const connectionString = process.env.DATABASE_URI;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Adding column layers_roof_bois_id to houses table...");
  
  await client.query("BEGIN");
  try {
    // Add the column
    await client.query(`
      ALTER TABLE houses 
      ADD COLUMN IF NOT EXISTS layers_roof_bois_id integer;
    `);
    
    // Add constraint if not exists
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'houses' AND constraint_name = 'houses_layers_roof_bois_id_media_id_fk';
    `);

    if (constraintCheck.rows.length === 0) {
      await client.query(`
        ALTER TABLE houses 
        ADD CONSTRAINT houses_layers_roof_bois_id_media_id_fk 
        FOREIGN KEY (layers_roof_bois_id) REFERENCES media(id) ON DELETE SET NULL;
      `);
      console.log("Column and foreign key constraint successfully created.");
    } else {
      console.log("Column exists and foreign key constraint already exists.");
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    process.exit(1);
  }

  await client.end();
}

main().catch(console.error);
