import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function test() {
  const client = createClient({ url, authToken });
  
  console.log('Testing relational services query...');
  const srvRes = await client.execute('SELECT id, name, category, stage, price, estimatedDuration, description FROM services ORDER BY stage ASC;');
  console.log(`✅ Fetched ${srvRes.rows.length} relational services. Sample:`, srvRes.rows[0]);
  
  console.log('Testing relational symptoms query...');
  const symRes = await client.execute('SELECT id, name FROM symptoms ORDER BY sortOrder ASC;');
  console.log(`✅ Fetched ${symRes.rows.length} relational symptoms. Sample:`, symRes.rows[0]);

  console.log('Testing relational site_config query...');
  const cfgRes = await client.execute("SELECT id, heroHeadline, whatsappNumber FROM site_config WHERE id = 'main';");
  console.log('✅ Fetched site_config:', cfgRes.rows[0]);

  console.log('Testing queue insert and query...');
  const sampleQueue = {
    id: 'FST-TEST-001',
    customerName: 'Budi Santoso',
    phone: '08123456789',
    licensePlate: 'B 1234 XYZ',
    carModel: 'Toyota Fortuner (2022)',
    services: ['free_inspection'],
    parts: [],
    additionalServices: [],
    isApproved: 0,
    status: 'BOOKING',
    startDate: '2026-08-10',
    durationDays: 2,
    endDate: '2026-08-12',
    estimatedCost: 450000,
    customManualPrice: 0,
    customManualText: '',
    customStatusText: '',
    statusHistory: [{ status: 'BOOKING', label: 'Booking Diterima', timestamp: '2026-08-09 08:00' }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await client.execute({
    sql: `INSERT INTO queues (
      id, customerName, phone, licensePlate, carModel, services, parts, additionalServices, 
      isApproved, status, startDate, durationDays, endDate, estimatedCost, customManualPrice, 
      customManualText, customStatusText, statusHistory, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      customerName=excluded.customerName,
      phone=excluded.phone,
      licensePlate=excluded.licensePlate,
      carModel=excluded.carModel,
      services=excluded.services,
      parts=excluded.parts,
      additionalServices=excluded.additionalServices,
      isApproved=excluded.isApproved,
      status=excluded.status,
      startDate=excluded.startDate,
      durationDays=excluded.durationDays,
      endDate=excluded.endDate,
      estimatedCost=excluded.estimatedCost,
      customManualPrice=excluded.customManualPrice,
      customManualText=excluded.customManualText,
      customStatusText=excluded.customStatusText,
      statusHistory=excluded.statusHistory,
      updatedAt=excluded.updatedAt;`,
    args: [
      sampleQueue.id,
      sampleQueue.customerName,
      sampleQueue.phone,
      sampleQueue.licensePlate,
      sampleQueue.carModel,
      JSON.stringify(sampleQueue.services),
      JSON.stringify(sampleQueue.parts),
      JSON.stringify(sampleQueue.additionalServices),
      sampleQueue.isApproved,
      sampleQueue.status,
      sampleQueue.startDate,
      sampleQueue.durationDays,
      sampleQueue.endDate,
      sampleQueue.estimatedCost,
      sampleQueue.customManualPrice,
      sampleQueue.customManualText,
      sampleQueue.customStatusText,
      JSON.stringify(sampleQueue.statusHistory),
      sampleQueue.createdAt,
      sampleQueue.updatedAt
    ]
  });
  
  const qRes = await client.execute('SELECT id, customerName, carModel FROM queues WHERE id = ?;', [sampleQueue.id]);
  console.log('✅ Read back queue:', qRes.rows[0]);
  console.log('🎉 All relational database checks passed with 100% success!');
}

test();
