// FSTWORKS Local Storage & Mock Data Management System

export const STORAGE_KEY = 'FSTWORKS_QUEUE_DATA_V3';
export const SERVICES_STORAGE_KEY = 'FSTWORKS_SERVICES_DATA_V1';
export const SYMPTOMS_STORAGE_KEY = 'FSTWORKS_SYMPTOMS_DATA_V1';
export const SITE_CONFIG_STORAGE_KEY = 'FSTWORKS_SITE_CONFIG_V1';
export const TESTIMONIALS_STORAGE_KEY = 'FSTWORKS_TESTIMONIALS_V1';

export const INITIAL_SITE_CONFIG = {
  heroBadge: 'Undercarriage Specialist',
  heroHeadline: 'FSTWORKS UNDERCARRIAGE SPECIALIST',
  heroSubheadline: 'Penanganan profesional & presisi suspensi kendaraan dari team FSTWORKS. Penjadwalan pengerjaan & estimasi biaya ditentukan langsung oleh Admin.',
  whatsappNumber: '6281234567890',
  operatingHours: 'Senin - Sabtu: 08:30 - 17:00 WIB',
  operatingHoursSunday: 'Minggu & Hari Libur: Tutup (Reservasi WA)',
  address: 'Jl. Raya Utama Otomotif No. 88, Pusat Suspensi & Steering, Jakarta / Indonesia',
  hotlinePhone: '0812-3456-7890',
  guaranteeText: 'Garansi Servis Sampai 12 Bulan'
};

export const INITIAL_TESTIMONIALS = [
  {
    id: 1,
    name: 'Bapak Aditia (Owner Fortuner VRZ)',
    rating: 5,
    comment: 'Masalah kaki-kaki di Fortuner saya yang bikin pusing akhirnya tuntas di FSTWORKS. Mekaniknya sangat paham detail, gratis inspeksi dulu baru tawarin estimasi yang jujur!'
  },
  {
    id: 2,
    name: 'Mas Farhan (Owner Civic Turbo)',
    rating: 5,
    comment: 'Fitur booking online sangat membantu! Datang sesuai jadwal ACC admin, mobil langsung ditangani tanpa nunggu berjam-jam. Recommended banget!'
  },
  {
    id: 3,
    name: 'Pak Rudi (Owner BMW E90)',
    rating: 5,
    comment: 'Spooring 3D laser-nya presisi banget, setir BMW saya yang tadinya miring sekarang lurus total. Hasil garansinya bikin tenang.'
  }
];

export const INITIAL_SERVICES = [
  {
    id: 'free_inspection',
    name: 'Free Check-Up Kaki-Kaki & Diagnosa (21 Titik)',
    category: 'Inspeksi & Diagnosa',
    price: 0,
    estimatedDuration: '20 Menit',
    description: 'Pengecekan fisik shockbreaker, tierod, ball joint, bushing, steering rack, bearing roda, dan test drive awal secara GRATIS.'
  },
  {
    id: 'shockbreaker_service',
    name: 'Servis & Rekondisi Shockbreaker (Depan/Belakang)',
    category: 'Suspensi',
    price: 250000,
    estimatedDuration: '90 Menit',
    description: 'Press oli, ganti seal high pressure, isi gas nitrogen & tuning keempukan (Soft/Hard/Standard).'
  },
  {
    id: 'tierod_balljoint',
    name: 'Rekondisi & Press Tierod, Long Tierod, Ball Joint',
    category: 'Kemudi & Ball Joint',
    price: 180000,
    estimatedDuration: '60 Menit',
    description: 'Mengatasi stir speling, bunyi kletek-kletek saat belok/jalan keriting, perbaikan ball joint presisi.'
  },
  {
    id: 'steering_rack',
    name: 'Overhaul / Repair Steering Rack & Power Steering',
    category: 'Kemudi & Ball Joint',
    price: 750000,
    estimatedDuration: '180 Menit',
    description: 'Perbaikan steering rack bocor, ganti seal kit OEM, ganti bushing teflon rack, hilangkan bunyi jeblug.'
  },
  {
    id: 'bushing_arm_replacement',
    name: 'Penggantian Bushing Arm & Axle (Set Kiri-Kanan)',
    category: 'Bushing & Arm',
    price: 350000,
    estimatedDuration: '90 Menit',
    description: 'Penggantian bushing rubber OEM atau Heavy-Duty Polyurethane agar sasis mobil stabil dan antilimbung.'
  },
  {
    id: 'spooring_balancing_3d',
    name: 'Paket Spooring 3D Laser + Dynamic Balancing 4 Roda',
    category: 'Presisi Wheel Alignment',
    price: 220000,
    estimatedDuration: '45 Menit',
    description: 'Kalibrasi kelurusan roda 3D sensor digital, balancing bobot timah digital, cegah ban makan sebelah.'
  },
  {
    id: 'custom_lowering_standard',
    name: 'Custom Fitting Suspensi / Lowering Kit / Re-Standard',
    category: 'Suspensi',
    price: 450000,
    estimatedDuration: '120 Menit',
    description: 'Tuning ketinggian mobil, potong/ganti per custom, pasang stopper polyurethane, bebas gesrot.'
  },
  {
    id: 'custom_manual_service',
    name: '📝 Layanan Custom / Perbaikan Spesifik (Isian Manual)',
    category: 'Custom Service',
    price: 0,
    isManual: true,
    estimatedDuration: 'Pengerjaan Intensif',
    description: 'Pilih ini jika perbaikan/custom yang Anda butuhkan tidak ada di daftar. Tuliskan deskripsi sendiri, harga akan ditentukan oleh Admin Workshop.'
  }
];

export const INITIAL_SYMPTOMS = [
  'Bunyi klok-klok / gertak saat lewat jalan keriting/lubang',
  'Setir getar / speling saat kecepatan di atas 70 km/jam',
  'Mobil narik ke kiri atau ke kanan saat jalan lurus',
  'Suspensi amblas / keras / ayunan tidak stabil',
  'Tetesan oli bocor dari area rack steer / power steering',
  'Ban mobil aus makan sebelah (luar/dalam)'
];

export const INITIAL_PITS = [
  { id: 'PIT-1', name: 'Pit 1 - Heavy Suspension & Rack', mechanic: 'Mas Budi (Master Mechanic)', status: 'BUSY' },
  { id: 'PIT-2', name: 'Pit 2 - Quick Shock & Bushing Press', mechanic: 'Mas Doni (Suspension Specialist)', status: 'BUSY' },
  { id: 'PIT-3', name: 'Pit 3 - Spooring 3D Digital Laser', mechanic: 'Mas Rian (Alignment Expert)', status: 'AVAILABLE' }
];

export const INITIAL_QUEUES = [
  {
    id: 'FST-20260802-1001',
    queueNumber: 'A-01',
    customerName: 'Bapak Hendra',
    phone: '081234567890',
    carModel: 'Toyota Fortuner VRZ',
    licensePlate: 'B 1988 FST',
    bookingDate: '2026-08-02',
    startDate: '2026-08-02',
    durationDays: 5,
    endDate: '2026-08-07',
    isApproved: true,
    bookingTime: '08:30',
    services: ['shockbreaker_service', 'bushing_arm_replacement'],
    assignedPit: 'PIT-1',
    mechanic: 'Mas Budi',
    status: 'PENGERJAAN',
    estimatedCost: 600000,
    notes: 'Geluduk di jalan berlubang, bagian depan kiri agak amblas.',
    createdAt: '2026-08-02T08:15:00Z',
    updatedAt: '2026-08-02T09:10:00Z'
  },
  {
    id: 'FST-20260802-1002',
    queueNumber: 'A-02',
    customerName: 'Mas Rizky',
    phone: '085711223344',
    carModel: 'Honda Civic Turbo',
    licensePlate: 'B 8080 CVC',
    bookingDate: '2026-08-05',
    startDate: '2026-08-05',
    durationDays: 3,
    endDate: '2026-08-08',
    isApproved: true,
    bookingTime: '10:00',
    services: ['tierod_balljoint', 'spooring_balancing_3d'],
    assignedPit: 'PIT-2',
    mechanic: 'Mas Doni',
    status: 'INSPEKSI',
    estimatedCost: 400000,
    notes: 'Setir terasa gejal-gejul saat kecepatan 80 km/jam.',
    createdAt: '2026-08-02T09:45:00Z',
    updatedAt: '2026-08-02T10:05:00Z'
  },
  {
    id: 'FST-20260810-1003',
    queueNumber: 'A-03',
    customerName: 'Ibu Ratna',
    phone: '081399887766',
    carModel: 'Mitsubishi Xpander',
    licensePlate: 'D 1234 XPD',
    bookingDate: '2026-08-10',
    startDate: '2026-08-10',
    durationDays: 5,
    endDate: '2026-08-15',
    isApproved: true,
    bookingTime: '11:30',
    services: ['steering_rack', 'bushing_arm_replacement'],
    assignedPit: 'PIT-1',
    mechanic: 'Mas Budi',
    status: 'PENGERJAAN',
    estimatedCost: 1100000,
    notes: 'Overhaul steering rack & penggantian bushing arm.',
    createdAt: '2026-08-02T10:30:00Z',
    updatedAt: '2026-08-02T10:30:00Z'
  },
  {
    id: 'FST-20260816-1004',
    queueNumber: 'A-04',
    customerName: 'Mas Danang',
    phone: '087855443322',
    carModel: 'Subaru Impreza WRX',
    licensePlate: 'B 555 WRX',
    bookingDate: '2026-08-16',
    startDate: '2026-08-16',
    durationDays: 4,
    endDate: '2026-08-20',
    isApproved: true,
    bookingTime: '13:30',
    services: ['custom_manual_service'],
    customManualText: 'Rakit custom coilover 32-step & ganti pillowball mount depan',
    customManualPrice: 1850000,
    assignedPit: 'PIT-1',
    mechanic: 'Mas Budi',
    status: 'BOOKING',
    estimatedCost: 1850000,
    notes: 'Permintaan Custom Manual Customer (Harga telah ditentukan Admin: Rp 1.850.000).',
    createdAt: '2026-08-02T11:00:00Z',
    updatedAt: '2026-08-02T11:00:00Z'
  }
];

export const getStoredServices = () => {
  try {
    const data = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    return JSON.parse(data);
  } catch (error) {
    return INITIAL_SERVICES;
  }
};

export const saveServicesToStorage = (services) => {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    console.error('Error saving services to localStorage:', error);
  }
};

export const getStoredSymptoms = () => {
  try {
    const data = localStorage.getItem(SYMPTOMS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(INITIAL_SYMPTOMS));
      return INITIAL_SYMPTOMS;
    }
    return JSON.parse(data);
  } catch (error) {
    return INITIAL_SYMPTOMS;
  }
};

export const saveSymptomsToStorage = (symptoms) => {
  try {
    localStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(symptoms));
  } catch (error) {
    console.error('Error saving symptoms to localStorage:', error);
  }
};

export const getStoredSiteConfig = () => {
  try {
    const data = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(INITIAL_SITE_CONFIG));
      return INITIAL_SITE_CONFIG;
    }
    return { ...INITIAL_SITE_CONFIG, ...JSON.parse(data) };
  } catch (error) {
    return INITIAL_SITE_CONFIG;
  }
};

export const saveSiteConfigToStorage = (config) => {
  try {
    localStorage.setItem(SITE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving site config to localStorage:', error);
  }
};

export const getStoredTestimonials = () => {
  try {
    const data = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
      return INITIAL_TESTIMONIALS;
    }
    return JSON.parse(data);
  } catch (error) {
    return INITIAL_TESTIMONIALS;
  }
};

export const saveTestimonialsToStorage = (testimonials) => {
  try {
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(testimonials));
  } catch (error) {
    console.error('Error saving testimonials to localStorage:', error);
  }
};

export const getStoredQueues = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUEUES));
      return INITIAL_QUEUES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading localStorage queues:', error);
    return INITIAL_QUEUES;
  }
};

export const saveQueuesToStorage = (queues) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queues));
  } catch (error) {
    console.error('Error saving queues to localStorage:', error);
  }
};

export const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FST-${dateStr}-${randomNum}`;
};

export const generateQueueNumber = (existingQueues) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayQueues = existingQueues.filter(q => q.bookingDate === today);
  const nextNum = todayQueues.length + 1;
  return `A-${nextNum < 10 ? '0' + nextNum : nextNum}`;
};

export const STATUS_MAP = {
  BOOKING: { label: 'Reservasi / Menunggu ACC', badgeClass: 'badge-warning', color: '#f59e0b', step: 1 },
  INSPEKSI: { label: 'Inspeksi & Diagnosa (Pit)', badgeClass: 'badge-info', color: '#06b6d4', step: 2 },
  PENGERJAAN: { label: 'Proses Pengerjaan (Menginap)', badgeClass: 'badge-primary', color: '#818cf8', step: 3 },
  TEST_DRIVE: { label: 'Test Drive & QC', badgeClass: 'badge-warning', color: '#eab308', step: 4 },
  SELESAI: { label: 'Selesai / Siap Diambil', badgeClass: 'badge-success', color: '#10b981', step: 5 },
  CUSTOM: { label: '📝 Status Custom (Isian Manual...)', badgeClass: 'badge-secondary', color: '#ec4899', step: 3 }
};
