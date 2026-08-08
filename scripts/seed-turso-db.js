import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

const INITIAL_SERVICES = [
  {
    id: 'free_inspection',
    name: 'Free Check-Up Kaki-Kaki & Diagnosa (21 Titik)',
    category: 'Inspeksi & Diagnosa',
    stage: 1,
    price: 0,
    estimatedDuration: '1 Hari',
    description: 'Pengecekan fisik shockbreaker, tierod, ball joint, bushing, steering rack, bearing roda, dan test drive awal secara GRATIS.'
  },
  {
    id: 'spooring_balancing_3d',
    name: 'Paket Spooring 3D Laser + Dynamic Balancing 4 Roda',
    category: 'Presisi Wheel Alignment',
    stage: 1,
    price: 220000,
    estimatedDuration: '1 Hari',
    description: 'Kalibrasi kelurusan roda 3D sensor digital, balancing bobot timah digital, cegah ban makan sebelah.'
  },
  {
    id: 'tierod_balljoint',
    name: 'Rekondisi & Press Tierod, Long Tierod, Ball Joint',
    category: 'Kemudi & Ball Joint',
    stage: 2,
    price: 180000,
    estimatedDuration: '1 Hari',
    description: 'Mengatasi stir speling, bunyi kletek-kletek saat belok/jalan keriting, perbaikan ball joint presisi.'
  },
  {
    id: 'shockbreaker_service',
    name: 'Servis & Rekondisi Shockbreaker (Depan/Belakang)',
    category: 'Suspensi',
    stage: 2,
    price: 250000,
    estimatedDuration: '1 Hari',
    description: 'Press oli, ganti seal high pressure, isi gas nitrogen & tuning keempukan (Soft/Hard/Standard).'
  },
  {
    id: 'bushing_arm_replacement',
    name: 'Penggantian Bushing Arm & Axle (Set Kiri-Kanan)',
    category: 'Bushing & Arm',
    stage: 2,
    price: 350000,
    estimatedDuration: '1 Hari',
    description: 'Penggantian bushing rubber OEM atau Heavy-Duty Polyurethane agar sasis mobil stabil dan antilimbung.'
  },
  {
    id: 'custom_lowering_standard',
    name: 'Custom Fitting Suspensi / Lowering Kit / Re-Standard',
    category: 'Suspensi',
    stage: 3,
    price: 450000,
    estimatedDuration: '2 Hari',
    description: 'Tuning ketinggian mobil, potong/ganti per custom, pasang stopper polyurethane, bebas gesrot.'
  },
  {
    id: 'steering_rack',
    name: 'Overhaul / Repair Steering Rack & Power Steering',
    category: 'Kemudi & Ball Joint',
    stage: 4,
    price: 750000,
    estimatedDuration: '3 Hari',
    description: 'Perbaikan steering rack bocor, ganti seal kit OEM, ganti bushing teflon rack, hilangkan bunyi jeblug.'
  },
  {
    id: 'custom_manual_service',
    name: '📝 Layanan Custom / Perbaikan Spesifik (Isian Manual)',
    category: 'Custom Service',
    stage: 5,
    price: 0,
    isManual: true,
    estimatedDuration: '5 Hari',
    description: 'Pilih ini jika perbaikan/custom yang Anda butuhkan tidak ada di daftar. Tuliskan deskripsi sendiri, harga akan ditentukan oleh Admin Workshop.'
  }
];

const INITIAL_SITE_CONFIG = {
  heroBadge: 'Undercarriage Specialist',
  heroHeadline: 'FSTWORKS UNDERCARRIAGE SPECIALIST',
  heroSubheadline: 'Penanganan profesional & presisi suspensi kendaraan dari team FSTWORKS. Penjadwalan pengerjaan & estimasi biaya ditentukan langsung oleh Admin.',
  whatsappNumber: '6281234567890',
  operatingHours: 'Senin - Sabtu: 08:30 - 17:00 WIB',
  operatingHoursSunday: 'Minggu & Hari Libur: Tutup (Reservasi WA)',
  address: 'Jl. Raya Utama Otomotif No. 88, Pusat Suspensi & Steering, Jakarta / Indonesia',
  hotlinePhone: '0812-3456-7890',
  guaranteeText: 'Garansi Servis Sampai 12 Bulan',
  bankName: 'BCA (Bank Central Asia)',
  bankAccount: '8830-1928-37',
  bankHolder: 'FSTWORKS GARAGE OFFICIAL',
  adminPin: '1234'
};

const INITIAL_SYMPTOMS = [
  'Bunyi klok-klok / gertak saat lewat jalan keriting/lubang',
  'Setir getar / speling saat kecepatan di atas 70 km/jam',
  'Mobil narik ke kiri atau ke kanan saat jalan lurus',
  'Suspensi amblas / keras / ayunan tidak stabil',
  'Tetesan oli bocor dari area rack steer / power steering',
  'Ban mobil aus makan sebelah (luar/dalam)'
];

async function seed() {
  console.log('🔌 Connecting to Turso Database:', url);
  const client = createClient({ url, authToken });

  try {
    console.log('🛠️ Re-creating table schema...');
    await client.execute('DROP TABLE IF EXISTS services;');
    await client.execute(`CREATE TABLE services (id TEXT PRIMARY KEY, json_data TEXT);`);

    await client.execute('DROP TABLE IF EXISTS site_config;');
    await client.execute(`CREATE TABLE site_config (id TEXT PRIMARY KEY, config_json TEXT);`);

    await client.execute('DROP TABLE IF EXISTS symptoms;');
    await client.execute(`CREATE TABLE symptoms (id TEXT PRIMARY KEY, json_data TEXT);`);

    await client.execute('DROP TABLE IF EXISTS holidays;');
    await client.execute(`CREATE TABLE holidays (id TEXT PRIMARY KEY, config_json TEXT);`);

    await client.execute('DROP TABLE IF EXISTS testimonials;');
    await client.execute(`CREATE TABLE testimonials (id TEXT PRIMARY KEY, json_data TEXT);`);

    console.log('🌱 Seeding default services catalog into Turso DB...');
    await client.execute({
      sql: `INSERT INTO services (id, json_data) VALUES ('catalog', ?);`,
      args: [JSON.stringify(INITIAL_SERVICES)]
    });

    console.log('🌱 Seeding site config into Turso DB...');
    await client.execute({
      sql: `INSERT INTO site_config (id, config_json) VALUES ('main', ?);`,
      args: [JSON.stringify(INITIAL_SITE_CONFIG)]
    });

    console.log('🌱 Seeding symptoms into Turso DB...');
    await client.execute({
      sql: `INSERT INTO symptoms (id, json_data) VALUES ('main', ?);`,
      args: [JSON.stringify(INITIAL_SYMPTOMS)]
    });

    console.log('🎉 Turso Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Error seeding Turso database:', err);
  }
}

seed();
