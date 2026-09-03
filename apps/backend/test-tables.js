const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.nvkzogsvkaflfqkasbem:crazykittens369S@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  console.log('Tables:', res.rows);
  await client.end();
}

main().catch(console.error);
