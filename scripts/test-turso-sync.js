import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function test() {
  const client = createClient({ url, authToken });
  
  console.log('Testing saving services...');
  const sampleServices = [
    { id: 'srv_1', name: 'Servis Kaki-Kaki Komplit', category: 'Suspensi', stage: 2, price: 450000, estimatedDuration: '2 Hari', description: 'Paket lengkap kaki-kaki' }
  ];
  
  await client.execute({
    sql: `INSERT INTO services (id, json_data) VALUES ('catalog', ?)
          ON CONFLICT(id) DO UPDATE SET json_data=excluded.json_data;`,
    args: [JSON.stringify(sampleServices)]
  });
  
  const res = await client.execute("SELECT json_data FROM services WHERE id = 'catalog';");
  console.log('Read back services:', JSON.parse(res.rows[0].json_data));
  
  console.log('Testing saving queue...');
  const sampleQueue = {
    id: 'FST-20260809-9999',
    customerName: 'Budi Santoso',
    phone: '08123456789',
    licensePlate: 'B 1234 XYZ',
    carModel: 'Toyota Fortuner (2022)',
    services: ['srv_1'],
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
  
  const qRes = await client.execute('SELECT * FROM queues WHERE id = ?;', [sampleQueue.id]);
  console.log('Read back queue count:', qRes.rows.length, qRes.rows[0].customerName);
}

test();
