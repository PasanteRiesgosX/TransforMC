const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.nvkzogsvkaflfqkasbem:crazykittens369S@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
});
async function main() {
  await client.connect();
  const res = await client.query('SELECT * FROM _prisma_migrations');
  console.log('Migrations:', res.rows);
  const users = await client.query('SELECT * FROM users');
  console.log('Users:', users.rows);
  await client.end();
}
main().catch(console.error);
