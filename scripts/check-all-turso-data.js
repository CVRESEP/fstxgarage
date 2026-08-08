import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function check() {
  const client = createClient({ url, authToken });
  
  console.log('--- TURSO DATABASE AUDIT ---');
  
  const queues = await client.execute('SELECT * FROM queues;');
  console.log(`[QUEUES] Total: ${queues.rows.length}`);
  console.log(queues.rows);

  const services = await client.execute('SELECT * FROM services;');
  console.log(`[SERVICES] Total: ${services.rows.length}`);
  console.log(services.rows);

  const products = await client.execute('SELECT * FROM products;');
  console.log(`[PRODUCTS] Total: ${products.rows.length}`);
  console.log(products.rows);

  const symptoms = await client.execute('SELECT * FROM symptoms;');
  console.log(`[SYMPTOMS] Total: ${symptoms.rows.length}`);
  console.log(symptoms.rows);

  const testimonials = await client.execute('SELECT * FROM testimonials;');
  console.log(`[TESTIMONIALS] Total: ${testimonials.rows.length}`);
  console.log(testimonials.rows);

  const siteConfig = await client.execute('SELECT * FROM site_config;');
  console.log(`[SITE_CONFIG] Total: ${siteConfig.rows.length}`);
  console.log(siteConfig.rows);

  const holidays = await client.execute('SELECT * FROM holidays;');
  console.log(`[HOLIDAYS] Total: ${holidays.rows.length}`);
  console.log(holidays.rows);
}

check();
