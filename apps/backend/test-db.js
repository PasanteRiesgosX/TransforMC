const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.nvkzogsvkaflfqkasbem:crazykittens369S@aws-0-us-east-1.pooler.supabase.com:5432/postgres'
});

async function main() {
  console.log('Connecting...');
  await client.connect();
  console.log('Connected!');
  
  console.log('Running query 1...');
  const res1 = await client.query('SELECT version()');
  console.log('Result 1:', res1.rows);

  console.log('Running query 2...');
  const res2 = await client.query("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'public'), version(), current_setting('server_version_num')::integer as numeric_version;");
  console.log('Result 2:', res2.rows);

  await client.end();
}

main().catch(console.error);
