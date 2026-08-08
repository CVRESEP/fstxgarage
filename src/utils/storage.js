// FSTWORKS Data Storage & Turso Cloud Sync Management System
import { 
  saveQueueToTurso,
  saveAllQueuesToTurso, 
  saveSiteConfigToTurso, 
  saveProductsToTurso,
  saveServicesToTurso, 
  saveHolidaysToTurso, 
  saveTestimonialsToTurso, 
  saveSymptomsToTurso 
} from './turso';

export const STORAGE_KEY = 'FSTWORKS_QUEUE_DATA_V3';
export const SERVICES_STORAGE_KEY = 'FSTWORKS_SERVICES_DATA_V1';
export const SYMPTOMS_STORAGE_KEY = 'FSTWORKS_SYMPTOMS_DATA_V1';
export const PRODUCTS_STORAGE_KEY = 'FSTWORKS_PRODUCTS_DATA_V1';
export const SITE_CONFIG_STORAGE_KEY = 'FSTWORKS_SITE_CONFIG_V1';
export const TESTIMONIALS_STORAGE_KEY = 'FSTWORKS_TESTIMONIALS_V1';

// NO DUMMY DATA - Clean production defaults
export const INITIAL_PRODUCTS = [];
export const INITIAL_TESTIMONIALS = [];
export const INITIAL_QUEUES = [];
export const INITIAL_SYMPTOMS = [];
export const INITIAL_SERVICES = [];

export const INITIAL_SITE_CONFIG = {
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

export const INITIAL_PITS = [
  { id: 'PIT-1', name: 'Pit 1 - Heavy Suspension & Rack', mechanic: 'Mechanic Master', status: 'AVAILABLE' },
  { id: 'PIT-2', name: 'Pit 2 - Quick Shock & Bushing Press', mechanic: 'Suspension Specialist', status: 'AVAILABLE' },
  { id: 'PIT-3', name: 'Pit 3 - Spooring 3D Digital Laser', mechanic: 'Alignment Expert', status: 'AVAILABLE' }
];

export const getStoredServices = () => {
  try {
    const data = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveServicesToStorage = (services) => {
  try {
    const arr = Array.isArray(services) ? services : [];
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(arr));
    saveServicesToTurso(arr);
  } catch (error) {
    console.error('Error saving services:', error);
  }
};

export const getStoredSymptoms = () => {
  try {
    const data = localStorage.getItem(SYMPTOMS_STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveSymptomsToStorage = (symptoms) => {
  try {
    const arr = Array.isArray(symptoms) ? symptoms : [];
    localStorage.setItem(SYMPTOMS_STORAGE_KEY, JSON.stringify(arr));
    saveSymptomsToTurso(arr);
  } catch (error) {
    console.error('Error saving symptoms:', error);
  }
};

export const getStoredProducts = () => {
  try {
    const data = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveProductsToStorage = (products) => {
  try {
    const arr = Array.isArray(products) ? products : [];
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(arr));
    saveProductsToTurso(arr);
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

export const getStoredSiteConfig = () => {
  try {
    const data = localStorage.getItem(SITE_CONFIG_STORAGE_KEY);
    if (!data) {
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
    saveSiteConfigToTurso(config);
  } catch (error) {
    console.error('Error saving site config:', error);
  }
};

export const getStoredTestimonials = () => {
  try {
    const data = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

export const saveTestimonialsToStorage = (testimonials) => {
  try {
    const arr = Array.isArray(testimonials) ? testimonials : [];
    localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(arr));
    saveTestimonialsToTurso(arr);
  } catch (error) {
    console.error('Error saving testimonials:', error);
  }
};

export const getStoredQueues = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data === null) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    const holConfig = getStoredHolidayConfig();
    const updated = parsed.map(q => {
      if (q.startDate && q.durationDays) {
        const correctEnd = calculateWorkdayEndDate(q.startDate, q.durationDays, holConfig);
        return { ...q, endDate: correctEnd };
      }
      return q;
    });
    return updated;
  } catch (error) {
    console.error('Error reading queues:', error);
    return [];
  }
};

export const saveQueuesToStorage = (queues) => {
  try {
    const arr = Array.isArray(queues) ? queues : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    saveAllQueuesToTurso(arr);
  } catch (error) {
    console.error('Error saving queues:', error);
  }
};

export const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FST-${dateStr}-${randomNum}`;
};

export const generateQueueNumber = (existingQueues = []) => {
  const today = new Date().toISOString().slice(0, 10);
  const todayQueues = (existingQueues || []).filter(q => q.bookingDate === today);
  const nextNum = todayQueues.length + 1;
  return `A-${nextNum < 10 ? '0' + nextNum : nextNum}`;
};

export const STATUS_MAP = {
  BOOKING: { label: 'Reservasi / Menunggu ACC', badgeClass: 'badge-warning', color: '#f59e0b', step: 1 },
  MENUNGGU_PENGANTARAN: { label: 'ACC Admin - Menunggu Pengantaran Mobil', badgeClass: 'badge-warning', color: '#06b6d4', step: 2 },
  INSPEKSI: { label: 'Inspeksi & Diagnosa (Pit)', badgeClass: 'badge-info', color: '#38bdf8', step: 3 },
  PENGERJAAN: { label: 'Proses Pengerjaan (Menginap)', badgeClass: 'badge-primary', color: '#818cf8', step: 4 },
  TEST_DRIVE: { label: 'Test Drive & QC', badgeClass: 'badge-warning', color: '#eab308', step: 5 },
  SELESAI: { label: 'Selesai / Siap Diambil', badgeClass: 'badge-success', color: '#10b981', step: 6 },
  CUSTOM: { label: '📝 Status Custom (Isian Manual...)', badgeClass: 'badge-secondary', color: '#ec4899', step: 4 }
};

// HOLIDAYS & WORKDAY CALCULATION LOGIC
export const HOLIDAYS_STORAGE_KEY = 'FSTWORKS_HOLIDAYS_V1';

export const INITIAL_HOLIDAY_CONFIG = {
  weeklyOff: [0], // 0 = Minggu
  specificHolidays: []
};

export const getStoredHolidayConfig = () => {
  try {
    const data = localStorage.getItem(HOLIDAYS_STORAGE_KEY);
    if (!data) {
      return INITIAL_HOLIDAY_CONFIG;
    }
    return JSON.parse(data);
  } catch (error) {
    return INITIAL_HOLIDAY_CONFIG;
  }
};

export const saveHolidayConfigToStorage = (config) => {
  try {
    localStorage.setItem(HOLIDAYS_STORAGE_KEY, JSON.stringify(config));
    saveHolidaysToTurso(config);
  } catch (error) {
    console.error('Error saving holiday config:', error);
  }
};

export const isHoliday = (dateObjOrStr, config = null) => {
  if (!config) config = getStoredHolidayConfig();
  const d = typeof dateObjOrStr === 'string' ? new Date(dateObjOrStr + 'T00:00:00') : new Date(dateObjOrStr);
  
  const dayOfWeek = d.getDay();
  if ((config.weeklyOff || []).includes(dayOfWeek)) {
    return { isHoliday: true, reason: 'Libur Rutin Workshop' };
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const spec = (config.specificHolidays || []).find(h => (typeof h === 'string' ? h === dateStr : h.date === dateStr));
  if (spec) {
    return { isHoliday: true, reason: typeof spec === 'string' ? 'Hari Libur Khusus' : spec.title || 'Hari Libur Khusus' };
  }

  return { isHoliday: false, reason: '' };
};

export const calculateWorkdayEndDate = (startDateStr, durationDays, config = null) => {
  if (!startDateStr) return startDateStr;
  const daysNeeded = Math.max(1, parseInt(durationDays, 10) || 1);
  if (!config) config = getStoredHolidayConfig();

  let curr = new Date(startDateStr + 'T00:00:00');
  let workdaysCount = 0;

  while (workdaysCount < daysNeeded) {
    const hol = isHoliday(curr, config);
    if (!hol.isHoliday) {
      workdaysCount++;
    }
    if (workdaysCount < daysNeeded) {
      curr.setDate(curr.getDate() + 1);
    }
  }

  const yyyy = curr.getFullYear();
  const mm = String(curr.getMonth() + 1).padStart(2, '0');
  const dd = String(curr.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
