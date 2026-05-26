const { Client } = require('pg');

const connectionString = "postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres";

const slugUpdates = {
  'flora-me-atike': 'flora-avec-attique',
  'emeraude-me-atike': 'emeraude-avec-attique',
  'france-etage-me-atike': 'france-etage-avec-attique',
  'liberte-etage-me-atike': 'liberte-etage-avec-attique',
  'enea-me-atike': 'enea-avec-attique',
  'forest-side-cabin-me-atike': 'forest-side-cabin-avec-attique',
  'monna-me-atike': 'monna-avec-attique',
  'ambre-me-atike': 'ambre-avec-attique',
  'boreale-me-atike': 'boreale-avec-attique',
  'asebra-me-atike': 'asebra-avec-attique',
  'maison-enea-me-kulm': 'enea-avec-toit',
  'asebra-me-kulm': 'asebra-avec-toit',
  'calme-me-atike': 'calme-avec-attique',
  'escape-villa-me-atike': 'escape-villa-avec-attique',
  'melodie-me-atike': 'melodie-avec-attique',
  'palma-etage-me-atike': 'palma-etage-avec-attique',
  'regence-me-atike': 'regence-avec-attique',
  'sira-me-atike': 'sira-avec-attique',
  'symphonie-me-atike': 'symphonie-avec-attique',
  'marinela-me-atike': 'marinela-avec-attique',
  'maison-2-etage-me-atike': 'maison-2-etages-avec-attique'
};

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to database.');

  try {
    await client.query('BEGIN');
    console.log('Transaction started.');

    // 1. Update slugs in houses table
    for (const [oldSlug, newSlug] of Object.entries(slugUpdates)) {
      const res = await client.query(
        'UPDATE houses SET slug = $1 WHERE slug = $2',
        [newSlug, oldSlug]
      );
      console.log(`Updated slug in houses table: ${oldSlug} -> ${newSlug} (${res.rowCount} row(s))`);
    }

    // 2. Perform search-replace on titles in houses_locales table to fix the Albanian terms
    const titleUpdates = [
      ["% me atike", " me atike", " avec Attique"],
      ["% me Atike", " me Atike", " avec Attique"],
      ["% me atikë", " me atikë", " avec Attique"],
      ["% me kulm", " me kulm", " avec Toit"],
      ["% me Kulm", " me Kulm", " avec Toit"],
      ["% me kulmë", " me kulmë", " avec Toit"],
      ["%etage me atike%", "etage me atike", "etage avec Attique"],
      ["%etage avec attique%", "etage avec attique", "avec Attique"],
      ["%etage me atike%", "etage me atike", "avec Attique"]
    ];

    for (const [likePattern, targetStr, replacementStr] of titleUpdates) {
      const res = await client.query(
        `UPDATE houses_locales 
         SET title = REPLACE(title, $1, $2) 
         WHERE title LIKE $3`,
        [targetStr, replacementStr, likePattern]
      );
      if (res.rowCount > 0) {
        console.log(`Updated localized titles matching "${likePattern}": replaced "${targetStr}" with "${replacementStr}" (${res.rowCount} row(s))`);
      }
    }

    // 3. Specifically fix titles for the 3 main models to be highly professional
    // For Liberte
    await client.query(
      `UPDATE houses_locales SET title = 'Liberté avec Attique' WHERE title LIKE '%Liberte%' AND title LIKE '%Attique%'`
    );
    // For France
    await client.query(
      `UPDATE houses_locales SET title = 'France avec Attique' WHERE title LIKE '%France%' AND title LIKE '%Attique%'`
    );
    // For Forest Side Cabin
    await client.query(
      `UPDATE houses_locales SET title = 'Forest Side Cabin avec Attique' WHERE title LIKE '%Forest%' AND title LIKE '%Attique%'`
    );

    console.log('Title normalization finished.');

    await client.query('COMMIT');
    console.log('Transaction committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', err);
    throw err;
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

main().catch(console.error);
