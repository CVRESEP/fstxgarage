import { createClient } from '@libsql/client/web';

const TURSO_CONFIG_KEY = 'FSTWORKS_TURSO_CONFIG_V1';

const DEFAULT_TURSO_URL = 'https://fstxgarage-db-fstworks.aws-ap-northeast-1.turso.io';
const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYxOTQxMzUsImlkIjoiMDE5ZmUxNzctMWMwMS03NjVlLWI5NGUtYzMyZmE4MmFlOWI5Iiwia2lkIjoickVqTnlrVGg3SC1iZHRwdXZmamhkdTBwQlJtT0tFczdjdFZKbWJRVC1GOCIsInJpZCI6IjZmNTcxNDM2LTdkYTctNGFmYi04MTY5LTI1ZDkzZjJmOGY3MiJ9.lFP45JLC-mzHUlLVs9iuNfUg8PmxDV2nqTMel1GBLlEcReezIyB67A6MTO1WdFBYwgQ7h72RWgPR4wFqD3OGAg';

export const getStoredTursoCredentials = () => {
  const envUrl = (import.meta.env?.VITE_TURSO_DATABASE_URL || '').trim();
  const envToken = (import.meta.env?.VITE_TURSO_AUTH_TOKEN || '').trim();

  let finalUrl = envUrl || DEFAULT_TURSO_URL;
  let finalToken = envToken || DEFAULT_TURSO_TOKEN;

  try {
    const saved = localStorage.getItem(TURSO_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.url.trim()) {
        finalUrl = parsed.url.trim();
      }
      if (parsed.authToken && parsed.authToken.trim()) {
        finalToken = parsed.authToken.trim();
      }
    }
  } catch (err) {
    console.error('Error reading Turso credentials:', err);
  }

  // Ensure HTTPS endpoint for browser fetch compatibility
  if (finalUrl.startsWith('libsql://')) {
    finalUrl = finalUrl.replace(/^libsql:\/\//, 'https://');
  }

  return {
    url: finalUrl,
    authToken: finalToken,
    isEnabled: Boolean(finalUrl)
  };
};

export const saveTursoCredentials = (credentials) => {
  try {
    let url = (credentials.url || '').trim();
    if (url.startsWith('libsql://')) {
      url = url.replace(/^libsql:\/\//, 'https://');
    }
    const cleanCreds = {
      url,
      authToken: (credentials.authToken || '').trim(),
      isEnabled: Boolean(url)
    };
    localStorage.setItem(TURSO_CONFIG_KEY, JSON.stringify(cleanCreds));
    resetTursoClient();
  } catch (err) {
    console.error('Error saving Turso credentials:', err);
  }
};

let libsqlClient = null;

export const getTursoClient = () => {
  const creds = getStoredTursoCredentials();
  if (!creds.isEnabled || !creds.url) return null;

  try {
    if (!libsqlClient) {
      libsqlClient = createClient({
        url: creds.url,
        authToken: creds.authToken || undefined
      });
    }
    return libsqlClient;
  } catch (err) {
    console.error('Failed to create LibSQL client:', err);
    return null;
  }
};

export const resetTursoClient = () => {
  libsqlClient = null;
};

// Initialize database schema with clean relational structure (No more json_data columns)
export const initTursoSchema = async () => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    // Check if legacy tables with json_data / config_json exist, and auto-migrate them
    try {
      const checkServices = await client.execute("PRAGMA table_info(services);");
      const hasJsonDataInServices = checkServices.rows.some(r => r.name === 'json_data');
      if (hasJsonDataInServices) {
        await client.execute("DROP TABLE IF EXISTS services;");
      }
    } catch (_) {}

    try {
      const checkTestimonials = await client.execute("PRAGMA table_info(testimonials);");
      const hasJsonDataInTestimonials = checkTestimonials.rows.some(r => r.name === 'json_data');
      if (hasJsonDataInTestimonials) {
        await client.execute("DROP TABLE IF EXISTS testimonials;");
      }
    } catch (_) {}

    try {
      const checkSymptoms = await client.execute("PRAGMA table_info(symptoms);");
      const hasJsonDataInSymptoms = checkSymptoms.rows.some(r => r.name === 'json_data');
      if (hasJsonDataInSymptoms) {
        await client.execute("DROP TABLE IF EXISTS symptoms;");
      }
    } catch (_) {}

    try {
      const checkSiteConfig = await client.execute("PRAGMA table_info(site_config);");
      const hasConfigJsonInSiteConfig = checkSiteConfig.rows.some(r => r.name === 'config_json');
      if (hasConfigJsonInSiteConfig) {
        await client.execute("DROP TABLE IF EXISTS site_config;");
      }
    } catch (_) {}

    try {
      const checkHolidays = await client.execute("PRAGMA table_info(holidays);");
      const hasConfigJsonInHolidays = checkHolidays.rows.some(r => r.name === 'config_json');
      if (hasConfigJsonInHolidays) {
        await client.execute("DROP TABLE IF EXISTS holidays;");
      }
    } catch (_) {}

    // Create normalized relational tables
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

    return true;
  } catch (err) {
    console.error('❌ Error initializing Turso DB schema:', err);
    return false;
  }
};

// Test Connection
export const testTursoConnection = async (url, authToken) => {
  try {
    let cleanUrl = (url || '').trim();
    if (cleanUrl.startsWith('libsql://')) {
      cleanUrl = cleanUrl.replace(/^libsql:\/\//, 'https://');
    }
    const tempClient = createClient({ url: cleanUrl, authToken: authToken || undefined });
    await tempClient.execute('SELECT 1;');
    return { success: true, message: 'Koneksi ke Turso Database Berhasil!' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal terhubung ke Turso DB.' };
  }
};

// --- COMPLETE DATA CRUD OPERATIONS FOR TURSO CLOUD DATABASE ---

// 1. Queues CRUD
export const fetchQueuesFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT * FROM queues ORDER BY createdAt DESC;');
    return res.rows.map(row => ({
      id: String(row.id),
      customerName: String(row.customerName || ''),
      phone: String(row.phone || ''),
      licensePlate: String(row.licensePlate || ''),
      carModel: String(row.carModel || ''),
      services: row.services ? JSON.parse(String(row.services)) : [],
      parts: row.parts ? JSON.parse(String(row.parts)) : [],
      additionalServices: row.additionalServices ? JSON.parse(String(row.additionalServices)) : [],
      isApproved: Boolean(row.isApproved),
      status: String(row.status || 'BOOKING'),
      startDate: String(row.startDate || ''),
      durationDays: Number(row.durationDays || 1),
      endDate: String(row.endDate || ''),
      estimatedCost: Number(row.estimatedCost || 0),
      customManualPrice: Number(row.customManualPrice || 0),
      customManualText: String(row.customManualText || ''),
      customStatusText: String(row.customStatusText || ''),
      statusHistory: row.statusHistory ? JSON.parse(String(row.statusHistory)) : [],
      createdAt: String(row.createdAt || new Date().toISOString()),
      updatedAt: String(row.updatedAt || new Date().toISOString())
    }));
  } catch (err) {
    console.error('Error fetching queues from Turso:', err);
    return null;
  }
};

export const saveQueueToTurso = async (q) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
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
        q.id,
        q.customerName || '',
        q.phone || '',
        q.licensePlate || '',
        q.carModel || '',
        JSON.stringify(q.services || []),
        JSON.stringify(q.parts || []),
        JSON.stringify(q.additionalServices || []),
        q.isApproved ? 1 : 0,
        q.status || 'BOOKING',
        q.startDate || '',
        q.durationDays || 1,
        q.endDate || '',
        q.estimatedCost || 0,
        q.customManualPrice || 0,
        q.customManualText || '',
        q.customStatusText || '',
        JSON.stringify(q.statusHistory || []),
        q.createdAt || new Date().toISOString(),
        q.updatedAt || new Date().toISOString()
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving queue to Turso:', err);
    return false;
  }
};

export const deleteQueueFromTurso = async (id) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM queues WHERE id = ?;',
      args: [id]
    });
    return true;
  } catch (err) {
    console.error('Error deleting queue from Turso:', err);
    return false;
  }
};

export const saveAllQueuesToTurso = async (queues) => {
  const client = getTursoClient();
  if (!client || !Array.isArray(queues)) return false;

  try {
    if (queues.length === 0) {
      await client.execute('DELETE FROM queues;');
      return true;
    }
    const placeholders = queues.map(() => '?').join(',');
    const deleteStmt = {
      sql: `DELETE FROM queues WHERE id NOT IN (${placeholders});`,
      args: queues.map(q => q.id)
    };
    const insertStmts = queues.map(q => ({
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
        q.id,
        q.customerName || '',
        q.phone || '',
        q.licensePlate || '',
        q.carModel || '',
        JSON.stringify(q.services || []),
        JSON.stringify(q.parts || []),
        JSON.stringify(q.additionalServices || []),
        q.isApproved ? 1 : 0,
        q.status || 'BOOKING',
        q.startDate || '',
        q.durationDays || 1,
        q.endDate || '',
        q.estimatedCost || 0,
        q.customManualPrice || 0,
        q.customManualText || '',
        q.customStatusText || '',
        JSON.stringify(q.statusHistory || []),
        q.createdAt || new Date().toISOString(),
        q.updatedAt || new Date().toISOString()
      ]
    }));

    await client.batch([deleteStmt, ...insertStmts], 'write');
    return true;
  } catch (err) {
    console.error('Error saving all queues to Turso:', err);
    return false;
  }
};

// 2. Site Config CRUD (Normalized Relational Columns)
export const fetchSiteConfigFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute("SELECT * FROM site_config WHERE id = 'main';");
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        heroBadge: String(row.heroBadge || ''),
        heroHeadline: String(row.heroHeadline || ''),
        heroSubheadline: String(row.heroSubheadline || ''),
        whatsappNumber: String(row.whatsappNumber || ''),
        operatingHours: String(row.operatingHours || ''),
        operatingHoursSunday: String(row.operatingHoursSunday || ''),
        address: String(row.address || ''),
        hotlinePhone: String(row.hotlinePhone || ''),
        guaranteeText: String(row.guaranteeText || ''),
        bankName: String(row.bankName || ''),
        bankAccount: String(row.bankAccount || ''),
        bankHolder: String(row.bankHolder || ''),
        adminPin: String(row.adminPin || '1234'),
        _maxStage: String(row.maxStage || '5'),
        _stageConfigs: row.stageConfigsJson ? JSON.parse(String(row.stageConfigsJson)) : undefined
      };
    }
  } catch (err) {
    console.error('Error fetching site config from Turso:', err);
  }
  return null;
};

export const saveSiteConfigToTurso = async (config) => {
  const client = getTursoClient();
  if (!client || !config) return false;

  try {
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
        config.heroBadge || '',
        config.heroHeadline || '',
        config.heroSubheadline || '',
        config.whatsappNumber || '',
        config.operatingHours || '',
        config.operatingHoursSunday || '',
        config.address || '',
        config.hotlinePhone || '',
        config.guaranteeText || '',
        config.bankName || '',
        config.bankAccount || '',
        config.bankHolder || '',
        config.adminPin || '1234',
        parseInt(config._maxStage || '5', 10) || 5,
        config._stageConfigs ? JSON.stringify(config._stageConfigs) : null
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving site config to Turso:', err);
    return false;
  }
};

// 3. Products CRUD (Normalized Relational Columns with Full Sync Deletion)
export const fetchProductsFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT * FROM products ORDER BY name ASC;');
    return res.rows.map(row => ({
      id: String(row.id),
      code: String(row.code || ''),
      name: String(row.name || ''),
      category: String(row.category || ''),
      price: Number(row.price || 0),
      stock: Number(row.stock || 0)
    }));
  } catch (err) {
    console.error('Error fetching products from Turso:', err);
    return null;
  }
};

export const saveProductToTurso = async (product) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: `INSERT INTO products (id, code, name, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              code=excluded.code, name=excluded.name, category=excluded.category,
              price=excluded.price, stock=excluded.stock;`,
      args: [product.id, product.code || '', product.name || '', product.category || '', product.price || 0, product.stock || 0]
    });
    return true;
  } catch (err) {
    console.error('Error saving product to Turso:', err);
    return false;
  }
};

export const deleteProductFromTurso = async (id) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM products WHERE id = ?;',
      args: [id]
    });
    return true;
  } catch (err) {
    console.error('Error deleting product from Turso:', err);
    return false;
  }
};

export const saveProductsToTurso = async (products) => {
  const client = getTursoClient();
  if (!client || !Array.isArray(products)) return false;

  try {
    if (products.length === 0) {
      await client.execute('DELETE FROM products;');
      return true;
    }
    const placeholders = products.map(() => '?').join(',');
    const deleteStmt = {
      sql: `DELETE FROM products WHERE id NOT IN (${placeholders});`,
      args: products.map(p => p.id)
    };
    const insertStmts = products.map(p => ({
      sql: `INSERT INTO products (id, code, name, category, price, stock)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              code=excluded.code,
              name=excluded.name,
              category=excluded.category,
              price=excluded.price,
              stock=excluded.stock;`,
      args: [p.id, p.code || '', p.name || '', p.category || '', Number(p.price || 0), Number(p.stock || 0)]
    }));

    await client.batch([deleteStmt, ...insertStmts], 'write');
    return true;
  } catch (err) {
    console.error('Error saving products to Turso:', err);
    return false;
  }
};

// 4. Services CRUD (Normalized Relational Columns with Full Sync Deletion)
export const fetchServicesFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT id, name, category, stage, price, estimatedDuration, description FROM services ORDER BY stage ASC, price ASC;');
    return res.rows.map(row => ({
      id: String(row.id),
      name: String(row.name || ''),
      category: String(row.category || ''),
      stage: Number(row.stage || 1),
      price: Number(row.price || 0),
      estimatedDuration: String(row.estimatedDuration || ''),
      description: String(row.description || '')
    }));
  } catch (err) {
    console.error('Error fetching services from Turso:', err);
    return null;
  }
};

export const saveServicesToTurso = async (services) => {
  const client = getTursoClient();
  if (!client || !Array.isArray(services)) return false;

  try {
    if (services.length === 0) {
      await client.execute('DELETE FROM services;');
      return true;
    }
    const placeholders = services.map(() => '?').join(',');
    const deleteStmt = {
      sql: `DELETE FROM services WHERE id NOT IN (${placeholders});`,
      args: services.map(s => s.id)
    };
    const insertStmts = services.map(s => ({
      sql: `INSERT INTO services (id, name, category, stage, price, estimatedDuration, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,
              category=excluded.category,
              stage=excluded.stage,
              price=excluded.price,
              estimatedDuration=excluded.estimatedDuration,
              description=excluded.description;`,
      args: [
        s.id,
        s.name || '',
        s.category || '',
        Number(s.stage || 1),
        Number(s.price || 0),
        s.estimatedDuration || '',
        s.description || ''
      ]
    }));

    await client.batch([deleteStmt, ...insertStmts], 'write');
    return true;
  } catch (err) {
    console.error('Error saving services to Turso:', err);
    return false;
  }
};

export const deleteServiceFromTurso = async (id) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM services WHERE id = ?;',
      args: [id]
    });
    return true;
  } catch (err) {
    console.error('Error deleting service from Turso:', err);
    return false;
  }
};

// 5. Holidays CRUD (Normalized Relational Columns: id, weeklyOff, specificHolidays)
export const fetchHolidaysFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute("SELECT weeklyOff, specificHolidays FROM holidays WHERE id = 'main';");
    if (res.rows.length > 0) {
      const row = res.rows[0];
      return {
        weeklyOff: row.weeklyOff ? JSON.parse(String(row.weeklyOff)) : [0],
        specificHolidays: row.specificHolidays ? JSON.parse(String(row.specificHolidays)) : []
      };
    }
  } catch (err) {
    console.error('Error fetching holidays from Turso:', err);
  }
  return null;
};

export const saveHolidaysToTurso = async (config) => {
  const client = getTursoClient();
  if (!client || !config) return false;

  try {
    await client.execute({
      sql: `INSERT INTO holidays (id, weeklyOff, specificHolidays) VALUES ('main', ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              weeklyOff=excluded.weeklyOff,
              specificHolidays=excluded.specificHolidays;`,
      args: [
        JSON.stringify(config.weeklyOff || [0]),
        JSON.stringify(config.specificHolidays || [])
      ]
    });
    return true;
  } catch (err) {
    console.error('Error saving holidays to Turso:', err);
    return false;
  }
};

// 6. Testimonials CRUD (Normalized Relational Columns with Full Sync Deletion)
export const fetchTestimonialsFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT id, name, rating, comment, createdAt FROM testimonials ORDER BY createdAt DESC;');
    return res.rows.map(row => ({
      id: String(row.id),
      name: String(row.name || ''),
      rating: Number(row.rating || 5),
      comment: String(row.comment || ''),
      createdAt: String(row.createdAt || '')
    }));
  } catch (err) {
    console.error('Error fetching testimonials from Turso:', err);
    return null;
  }
};

export const saveTestimonialsToTurso = async (testimonials) => {
  const client = getTursoClient();
  if (!client || !Array.isArray(testimonials)) return false;

  try {
    if (testimonials.length === 0) {
      await client.execute('DELETE FROM testimonials;');
      return true;
    }
    const placeholders = testimonials.map(() => '?').join(',');
    const deleteStmt = {
      sql: `DELETE FROM testimonials WHERE id NOT IN (${placeholders});`,
      args: testimonials.map(t => String(t.id))
    };
    const insertStmts = testimonials.map(t => ({
      sql: `INSERT INTO testimonials (id, name, rating, comment, createdAt)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name=excluded.name,
              rating=excluded.rating,
              comment=excluded.comment;`,
      args: [
        String(t.id || Date.now()),
        t.name || '',
        Number(t.rating || 5),
        t.comment || '',
        t.createdAt || new Date().toISOString()
      ]
    }));

    await client.batch([deleteStmt, ...insertStmts], 'write');
    return true;
  } catch (err) {
    console.error('Error saving testimonials to Turso:', err);
    return false;
  }
};

export const deleteTestimonialFromTurso = async (id) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: 'DELETE FROM testimonials WHERE id = ?;',
      args: [String(id)]
    });
    return true;
  } catch (err) {
    console.error('Error deleting testimonial from Turso:', err);
    return false;
  }
};

// 7. Symptoms CRUD (Normalized Relational Columns with Full Sync Deletion)
export const fetchSymptomsFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute('SELECT id, name FROM symptoms ORDER BY sortOrder ASC, rowid ASC;');
    return res.rows.map(row => String(row.name));
  } catch (err) {
    console.error('Error fetching symptoms from Turso:', err);
    return null;
  }
};

export const saveSymptomsToTurso = async (symptoms) => {
  const client = getTursoClient();
  if (!client || !Array.isArray(symptoms)) return false;

  try {
    const deleteStmt = { sql: 'DELETE FROM symptoms;', args: [] };
    if (symptoms.length === 0) {
      await client.execute(deleteStmt);
      return true;
    }
    const insertStmts = symptoms.map((text, idx) => ({
      sql: 'INSERT INTO symptoms (id, name, sortOrder) VALUES (?, ?, ?);',
      args: [`sym_${idx + 1}`, text, idx + 1]
    }));

    await client.batch([deleteStmt, ...insertStmts], 'write');
    return true;
  } catch (err) {
    console.error('Error saving symptoms to Turso:', err);
    return false;
  }
};
