import { createClient } from '@libsql/client/web';

const url = 'https://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function testWeb() {
  console.log('Testing @libsql/client/web with HTTPS url...');
  const client = createClient({ url, authToken });
  
  const res = await client.execute('SELECT * FROM services;');
  console.log('✅ Services fetched via web client:', res.rows.length);

  const queues = await client.execute('SELECT * FROM queues;');
  console.log('✅ Queues fetched via web client:', queues.rows.length);

  const config = await client.execute("SELECT * FROM site_config WHERE id = 'main';");
  console.log('✅ Site config fetched via web client:', config.rows[0]?.heroHeadline);
}

testWeb();
