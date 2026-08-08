import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function main() {
  console.log('🔌 Connecting to Turso Database:', url);
  const client = createClient({ url, authToken });

  try {
    const testRes = await client.execute('SELECT 1;');
    console.log('✅ Connection test successful!', testRes.rows);

    console.log('🛠️ Creating database tables...');
    await client.batch([
      `CREATE TABLE IF NOT EXISTS queues (
        id TEXT PRIMARY KEY,
        customerName TEXT,
        phone TEXT,
        licensePlate TEXT,
        carModel TEXT,
        services TEXT,
        parts TEXT,
        additionalServices TEXT,
        isApproved INTEGER,
        status TEXT,
        startDate TEXT,
        durationDays INTEGER,
        endDate TEXT,
        estimatedCost REAL,
        customManualPrice REAL,
        customManualText TEXT,
        customStatusText TEXT,
        statusHistory TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        duration TEXT,
        description TEXT,
        stage INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT,
        name TEXT,
        category TEXT,
        price REAL,
        stock INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS site_config (
        id TEXT PRIMARY KEY,
        config_json TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY,
        config_json TEXT
      );`
    ], 'write');

    console.log('🎉 All Turso tables created successfully!');
  } catch (err) {
    console.error('❌ Error in Turso DB initialization:', err);
  }
}

main();
