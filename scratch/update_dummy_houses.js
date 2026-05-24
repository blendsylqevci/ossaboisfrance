const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
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
  }
} catch (err) {
  console.error(err);
}

// Slugs of dummy houses and their target prices
const dummyHouses = [
  // Category 1: Flat roof houses
  {
    slug: 'marinela-me-atike',
    price160: 23800,
    price200: 25300,
    bruto: 112.7,
    neto: 98,
    mure_jashtme: 130,
    mure_mbajtese: 43,
    mure_ndarese: 54,
    pllaka_kulmit: 148,
    kulmi: 148,
    pllaka_katit: null
  },
  {
    slug: 'monna-me-atike',
    price160: 24500,
    price200: 26000,
    bruto: 115.8,
    neto: 98.6,
    mure_jashtme: 132,
    mure_mbajtese: 30,
    mure_ndarese: 24,
    pllaka_kulmit: 120,
    kulmi: 120,
    pllaka_katit: null
  },
  
  // Category 2: Flat roof houses with floor
  {
    slug: 'australe',
    price160: 41500,
    price200: 44650,
    bruto: 113.6,
    neto: 92.6,
    mure_jashtme: 240,
    mure_mbajtese: 56,
    mure_ndarese: 36,
    pllaka_kulmit: 113,
    kulmi: 0,
    pllaka_katit: 113
  },
  {
    slug: 'calme-me-atike',
    price160: 31292,
    price200: 32792,
    bruto: 132.1,
    neto: 115.8,
    mure_jashtme: 160,
    mure_mbajtese: 38,
    mure_ndarese: 26,
    pllaka_kulmit: 132,
    kulmi: 132,
    pllaka_katit: null
  },
  {
    slug: 'escape-villa-me-atike',
    price160: 29500,
    price200: 31000,
    bruto: 120.4,
    neto: 104.2,
    mure_jashtme: 185,
    mure_mbajtese: 32,
    mure_ndarese: 50,
    pllaka_kulmit: 120,
    kulmi: 120,
    pllaka_katit: null
  },
  {
    slug: 'flora-me-atike',
    price160: 27800,
    price200: 29300,
    bruto: 124.8,
    neto: 109,
    mure_jashtme: 167,
    mure_mbajtese: 41,
    mure_ndarese: 63,
    pllaka_kulmit: 122,
    kulmi: 122,
    pllaka_katit: null
  },
  {
    slug: 'forest-side-cabin-me-atike',
    price160: 26500,
    price200: 28000,
    bruto: 120.0,
    neto: 105,
    mure_jashtme: 155,
    mure_mbajtese: 35,
    mure_ndarese: 55,
    pllaka_kulmit: 118,
    kulmi: 118,
    pllaka_katit: null
  },
  {
    slug: 'france-etage-me-atike',
    price160: 32000,
    price200: 33500,
    bruto: 145.0,
    neto: 125,
    mure_jashtme: 190,
    mure_mbajtese: 45,
    mure_ndarese: 60,
    pllaka_kulmit: 140,
    kulmi: 140,
    pllaka_katit: 140
  },
  {
    slug: 'liberte-etage-me-atike',
    price160: 31000,
    price200: 32500,
    bruto: 138.0,
    neto: 120,
    mure_jashtme: 180,
    mure_mbajtese: 40,
    mure_ndarese: 58,
    pllaka_kulmit: 135,
    kulmi: 135,
    pllaka_katit: 135
  },
  {
    slug: 'maison-2-etage-me-atike',
    price160: 33000,
    price200: 34500,
    bruto: 150.0,
    neto: 130,
    mure_jashtme: 200,
    mure_mbajtese: 48,
    mure_ndarese: 65,
    pllaka_kulmit: 145,
    kulmi: 145,
    pllaka_katit: 145
  },
  {
    slug: 'maison-en-l-avec-attique',
    price160: 34000,
    price200: 35500,
    bruto: 155.0,
    neto: 135,
    mure_jashtme: 210,
    mure_mbajtese: 50,
    mure_ndarese: 70,
    pllaka_kulmit: 150,
    kulmi: 150,
    pllaka_katit: 150
  },
  {
    slug: 'melodie-me-atike',
    price160: 28500,
    price200: 30000,
    bruto: 128.0,
    neto: 112,
    mure_jashtme: 170,
    mure_mbajtese: 42,
    mure_ndarese: 64,
    pllaka_kulmit: 124,
    kulmi: 124,
    pllaka_katit: null
  },
  {
    slug: 'palma-etage-me-atike',
    price160: 32500,
    price200: 34000,
    bruto: 148.0,
    neto: 128,
    mure_jashtme: 195,
    mure_mbajtese: 46,
    mure_ndarese: 62,
    pllaka_kulmit: 142,
    kulmi: 142,
    pllaka_katit: 142
  },
  {
    slug: 'regence-me-atike',
    price160: 29000,
    price200: 30500,
    bruto: 130.0,
    neto: 114,
    mure_jashtme: 172,
    mure_mbajtese: 44,
    mure_ndarese: 66,
    pllaka_kulmit: 126,
    kulmi: 126,
    pllaka_katit: null
  },
  {
    slug: 'sira-me-atike',
    price160: 28000,
    price200: 29500,
    bruto: 125.0,
    neto: 110,
    mure_jashtme: 168,
    mure_mbajtese: 40,
    mure_ndarese: 62,
    pllaka_kulmit: 122,
    kulmi: 122,
    pllaka_katit: null
  },
  {
    slug: 'symphonie-me-atike',
    price160: 29500,
    price200: 31000,
    bruto: 132.0,
    neto: 116,
    mure_jashtme: 175,
    mure_mbajtese: 45,
    mure_ndarese: 68,
    pllaka_kulmit: 128,
    kulmi: 128,
    pllaka_katit: null
  },
  
  // Category 3: Single-story houses
  {
    slug: 'maison-e',
    price160: 21000,
    price200: 22500,
    bruto: 110.0,
    neto: 96,
    mure_jashtme: 130,
    mure_mbajtese: 30,
    mure_ndarese: 50,
    pllaka_kulmit: 145,
    kulmi: 145,
    pllaka_katit: null
  },
  
  // Category 4: Houses with convertible attics
  {
    slug: 'azura-comble',
    price160: 27500,
    price200: 29000,
    bruto: 130.0,
    neto: 112,
    mure_jashtme: 140,
    mure_mbajtese: 28,
    mure_ndarese: 60,
    pllaka_kulmit: 80,
    kulmi: 125,
    pllaka_katit: null
  },
  {
    slug: 'els-house-comble',
    price160: 28000,
    price200: 29500,
    bruto: 132.0,
    neto: 114,
    mure_jashtme: 142,
    mure_mbajtese: 29,
    mure_ndarese: 62,
    pllaka_kulmit: 82,
    kulmi: 127,
    pllaka_katit: null
  },
  {
    slug: 'france-comble',
    price160: 29000,
    price200: 30500,
    bruto: 134.0,
    neto: 116,
    mure_jashtme: 144,
    mure_mbajtese: 30,
    mure_ndarese: 64,
    pllaka_kulmit: 84,
    kulmi: 129,
    pllaka_katit: null
  },
  {
    slug: 'mountain-valley-villa-comble',
    price160: 30000,
    price200: 31500,
    bruto: 136.0,
    neto: 118,
    mure_jashtme: 146,
    mure_mbajtese: 31,
    mure_ndarese: 66,
    pllaka_kulmit: 86,
    kulmi: 131,
    pllaka_katit: null
  }
];

async function main() {
  const pgClient = new Client({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false }
  });
  await pgClient.connect();
  console.log('Connected to database.');

  try {
    await pgClient.query('BEGIN');
    console.log('Transaction started.');

    for (const h of dummyHouses) {
      console.log(`Updating house ${h.slug}...`);
      
      const query = `
        UPDATE houses
        SET
          price60x160 = $1,
          price60x200 = $2,
          margin_percent = $3,
          perdhesa_bruto = $4,
          perdhesa_neto = $5,
          perdhesa_mure_te_jashtme = $6,
          perdhesa_mure_mbajtese = $7,
          perdhesa_mure_ndarese = $8,
          perdhesa_pllaka_e_kulmit = $9,
          perdhesa_kulmi = $10,
          perdhesa_pllaka_e_katit = $11,
          windows_aluminium_price = $12,
          windows_pvc_price = $13,
          updated_at = $14
        WHERE slug = $15
      `;

      const res = await pgClient.query(query, [
        h.price160,
        h.price200,
        40, // margin_percent
        h.bruto,
        h.neto,
        h.mure_jashtme,
        h.mure_mbajtese,
        h.mure_ndarese,
        h.pllaka_kulmit,
        h.kulmi,
        h.pllaka_katit,
        7564, // windows_aluminium_price
        6176, // windows_pvc_price
        new Date(),
        h.slug
      ]);

      console.log(` -> Updated ${res.rowCount} row(s) for ${h.slug}.`);
    }

    await pgClient.query('COMMIT');
    console.log('Transaction committed successfully.');
  } catch (err) {
    await pgClient.query('ROLLBACK');
    console.error('Transaction rolled back due to error:', err);
    throw err;
  } finally {
    await pgClient.end();
    console.log('Database connection closed.');
  }
}

main().catch(console.error);
