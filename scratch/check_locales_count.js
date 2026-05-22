const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();

  const res = await client.query(`
    SELECT _locale, COUNT(*) 
    FROM houses_locales 
    GROUP BY _locale
  `);
  console.log("Locale counts in houses_locales:", res.rows);

  const resMedia = await client.query(`
    SELECT _locale, COUNT(*) 
    FROM media_locales 
    GROUP BY _locale
  `);
  console.log("Locale counts in media_locales:", resMedia.rows);

  await client.end();
}

main().catch(console.error);
