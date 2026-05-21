const { Client } = require('pg');

const connectionString = 'postgresql://postgres.spyhpakoxxzceltbdehn:Kosova1244%24%24%24.@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

console.log('Connecting to database...');
const startTime = Date.now();
const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log(`Connected successfully in ${Date.now() - startTime}ms`);
    return client.query('SELECT 1 as result');
  })
  .then(res => {
    console.log('Query result:', res.rows);
    return client.end();
  })
  .catch(err => {
    console.error('Connection error:', err);
  });
