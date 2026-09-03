const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.nvkzogsvkaflfqkasbem:crazykittens369S@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
});
async function main() {
  await client.connect();
  await client.query('DROP TABLE IF EXISTS users CASCADE;');
  await client.query('DROP TABLE IF EXISTS _prisma_migrations CASCADE;');
  console.log('Tables dropped.');
  await client.end();
}
main().catch(console.error);
