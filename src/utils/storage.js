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
      // For active / unfinished queues, calculate projected workday end date
      if (q.startDate && q.durationDays && q.status !== 'SELESAI') {
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

// Helper to parse multiple date formats (ISO YYYY-MM-DD, Indonesian formatted date, DD/MM/YYYY)
export const parseDateToTimestamp = (dateVal) => {
  if (!dateVal || dateVal === '-') return null;
  if (dateVal instanceof Date) return dateVal.getTime();

  const str = String(dateVal).trim();

  const indoMonths = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mei': 4, 'jun': 5,
    'jul': 6, 'agu': 7, 'agt': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11,
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
  };

  // 1. Pattern: "09 Agu 2026", "9 Agu 2026", "09 Agu 2026, 01:57 WIB", "09 Agustus 2026"
  const dmyMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthKey = dmyMatch[2].toLowerCase().slice(0, 3);
    const year = parseInt(dmyMatch[3], 10);
    const month = indoMonths[monthKey] !== undefined ? indoMonths[monthKey] : 0;
    return new Date(year, month, day).getTime();
  }

  // 2. Pattern: "DD/MM/YYYY"
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    const year = parseInt(slashMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  // 3. Pattern: YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(year, month, day).getTime();
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? null : parsed;
};

// Helper to extract accurate start date when work actually began (PENGERJAAN status or startDate)
export const getQueueStartDate = (queue) => {
  if (!queue) return '-';
  // 1. Check statusHistory for the exact PENGERJAAN timestamp
  if (queue.statusHistory && Array.isArray(queue.statusHistory)) {
    const pengerjaanLog = queue.statusHistory.find(h => h.status === 'PENGERJAAN');
    if (pengerjaanLog && pengerjaanLog.timestamp) {
      return pengerjaanLog.timestamp.split(',')[0].trim();
    }
  }
  // 2. Check startDate
  if (queue.startDate) return queue.startDate;
  // 3. Fallback to bookingDate or createdAt
  return queue.bookingDate || queue.createdAt || '-';
};

// Calculate actual duration in days dynamically between entry date (PENGERJAAN / startDate) and exit date (SELESAI statusHistory / endDate)
export const calculateActualWorkDuration = (queue) => {
  if (!queue) return '1 Hari';

  // Extract start date when work actually began (PENGERJAAN)
  let startVal = queue.startDate;
  if (queue.statusHistory && Array.isArray(queue.statusHistory)) {
    const pengerjaanLog = queue.statusHistory.find(h => h.status === 'PENGERJAAN');
    if (pengerjaanLog && pengerjaanLog.timestamp) {
      startVal = pengerjaanLog.timestamp;
    }
  }
  if (!startVal) {
    startVal = queue.startDate || queue.bookingDate || queue.createdAt;
  }
  
  let endVal = queue.endDate;
  if (queue.statusHistory && Array.isArray(queue.statusHistory)) {
    const selesaiLog = queue.statusHistory.find(h => h.status === 'SELESAI');
    if (selesaiLog && selesaiLog.timestamp) {
      endVal = selesaiLog.timestamp;
    }
  }
  if (!endVal) {
    endVal = queue.completedAt || queue.updatedAt || startVal;
  }

  const startTs = parseDateToTimestamp(startVal);
  const endTs = parseDateToTimestamp(endVal);

  if (startTs && endTs) {
    const diffMs = endTs - startTs;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    // If entered & finished on same day (e.g. diff <= 0), count as 1 Hari
    if (diffDays <= 0) {
      return '1 Hari';
    }
    return `${diffDays} Hari`;
  }

  return `${queue.durationDays || 1} Hari`;
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
