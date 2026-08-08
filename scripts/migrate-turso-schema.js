import { createClient } from '@libsql/client';

const url = 'libsql://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

async function migrate() {
  console.log('🔌 Connecting to Turso to migrate database schema from json_data to structured relational columns...');
  const client = createClient({ url, authToken });

  try {
    // 1. Drop old tables that had json_data / config_json
    console.log('🗑️ Dropping legacy json_data tables...');
    await client.batch([
      'DROP TABLE IF EXISTS services;',
      'DROP TABLE IF EXISTS testimonials;',
      'DROP TABLE IF EXISTS symptoms;',
      'DROP TABLE IF EXISTS site_config;',
      'DROP TABLE IF EXISTS holidays;'
    ], 'write');

    console.log('🛠️ Creating normalized relational tables...');
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
        name TEXT NOT NULL,
        category TEXT,
        stage INTEGER DEFAULT 1,
        price REAL DEFAULT 0,
        estimatedDuration TEXT,
        description TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT,
        name TEXT,
        category TEXT,
        price REAL DEFAULT 0,
        stock INTEGER DEFAULT 0
      );`,
      `CREATE TABLE IF NOT EXISTS site_config (
        id TEXT PRIMARY KEY,
        heroBadge TEXT,
        heroHeadline TEXT,
        heroSubheadline TEXT,
        whatsappNumber TEXT,
        operatingHours TEXT,
        operatingHoursSunday TEXT,
        address TEXT,
        hotlinePhone TEXT,
        guaranteeText TEXT,
        bankName TEXT,
        bankAccount TEXT,
        bankHolder TEXT,
        adminPin TEXT,
        maxStage INTEGER DEFAULT 5,
        stageConfigsJson TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS holidays (
        id TEXT PRIMARY KEY,
        weeklyOff TEXT,
        specificHolidays TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating INTEGER DEFAULT 5,
        comment TEXT,
        createdAt TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS symptoms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sortOrder INTEGER DEFAULT 0
      );`
    ], 'write');

    console.log('✨ Inserting initial normalized service records...');
    const initialServices = [
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
        estimatedDuration: '5 Hari',
        description: 'Pilih ini jika perbaikan/custom yang Anda butuhkan tidak ada di daftar. Tuliskan deskripsi sendiri, harga akan ditentukan oleh Admin Workshop.'
      }
    ];

    for (const s of initialServices) {
      await client.execute({
        sql: `INSERT INTO services (id, name, category, stage, price, estimatedDuration, description)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                category=excluded.category,
                stage=excluded.stage,
                price=excluded.price,
                estimatedDuration=excluded.estimatedDuration,
                description=excluded.description;`,
        args: [s.id, s.name, s.category, s.stage, s.price, s.estimatedDuration, s.description]
      });
    }

    console.log('✨ Inserting initial normalized symptoms...');
    const initialSymptoms = [
      'Bunyi klok-klok / gertak saat lewat jalan keriting/lubang',
      'Setir getar / speling saat kecepatan di atas 70 km/jam',
      'Mobil narik ke kiri atau ke kanan saat jalan lurus',
      'Suspensi amblas / keras / ayunan tidak stabil',
      'Tetesan oli bocor dari area rack steer / power steering',
      'Ban mobil aus makan sebelah (luar/dalam)'
    ];

    for (let i = 0; i < initialSymptoms.length; i++) {
      await client.execute({
        sql: 'INSERT INTO symptoms (id, name, sortOrder) VALUES (?, ?, ?);',
        args: [`sym_${i + 1}`, initialSymptoms[i], i + 1]
      });
    }

    console.log('✨ Inserting initial site config...');
    await client.execute({
      sql: `INSERT INTO site_config (
        id, heroBadge, heroHeadline, heroSubheadline, whatsappNumber, operatingHours,
        operatingHoursSunday, address, hotlinePhone, guaranteeText, bankName,
        bankAccount, bankHolder, adminPin, maxStage, stageConfigsJson
      ) VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        heroBadge=excluded.heroBadge,
        heroHeadline=excluded.heroHeadline,
        heroSubheadline=excluded.heroSubheadline,
        whatsappNumber=excluded.whatsappNumber,
        operatingHours=excluded.operatingHours,
        operatingHoursSunday=excluded.operatingHoursSunday,
        address=excluded.address,
        hotlinePhone=excluded.hotlinePhone,
        guaranteeText=excluded.guaranteeText,
        bankName=excluded.bankName,
        bankAccount=excluded.bankAccount,
        bankHolder=excluded.bankHolder,
        adminPin=excluded.adminPin,
        maxStage=excluded.maxStage,
        stageConfigsJson=excluded.stageConfigsJson;`,
      args: [
        'Undercarriage Specialist',
        'FSTWORKS UNDERCARRIAGE SPECIALIST',
        'Penanganan profesional & presisi suspensi kendaraan dari team FSTWORKS. Penjadwalan pengerjaan & estimasi biaya ditentukan langsung oleh Admin.',
        '6281234567890',
        'Senin - Sabtu: 08:30 - 17:00 WIB',
        'Minggu & Hari Libur: Tutup (Reservasi WA)',
        'Jl. Raya Utama Otomotif No. 88, Pusat Suspensi & Steering, Jakarta / Indonesia',
        '0812-3456-7890',
        'Garansi Servis Sampai 12 Bulan',
        'BCA (Bank Central Asia)',
        '8830-1928-37',
        'FSTWORKS GARAGE OFFICIAL',
        '1234',
        5,
        null
      ]
    });

    console.log('✨ Inserting initial holidays config...');
    await client.execute({
      sql: `INSERT INTO holidays (id, weeklyOff, specificHolidays) VALUES ('main', ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              weeklyOff=excluded.weeklyOff,
              specificHolidays=excluded.specificHolidays;`,
      args: [JSON.stringify([0]), JSON.stringify([])]
    });

    // Verification
    const servicesRes = await client.execute('SELECT * FROM services;');
    console.log(`✅ Normalized services count: ${servicesRes.rows.length}`);
    console.log('First service columns:', Object.keys(servicesRes.rows[0]));
    console.log('First service data:', servicesRes.rows[0]);

    const symptomsRes = await client.execute('SELECT * FROM symptoms;');
    console.log(`✅ Normalized symptoms count: ${symptomsRes.rows.length}`);

    const configRes = await client.execute("SELECT * FROM site_config WHERE id = 'main';");
    console.log('✅ Site config columns:', Object.keys(configRes.rows[0]));

    console.log('🎉 Turso database successfully migrated to clean relational structure!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  }
}

migrate();
