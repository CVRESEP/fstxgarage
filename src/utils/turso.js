import { createClient } from '@libsql/client/web';

const TURSO_CONFIG_KEY = 'FSTWORKS_TURSO_CONFIG_V1';

export const getStoredTursoCredentials = () => {
  const envUrl = import.meta.env?.VITE_TURSO_DATABASE_URL || '';
  const envToken = import.meta.env?.VITE_TURSO_AUTH_TOKEN || '';

  try {
    const saved = localStorage.getItem(TURSO_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        authToken: parsed.authToken || envToken,
        isEnabled: parsed.isEnabled !== false && Boolean(parsed.url || envUrl)
      };
    }
  } catch (err) {
    console.error('Error reading Turso credentials:', err);
  }

  return {
    url: envUrl,
    authToken: envToken,
    isEnabled: Boolean(envUrl)
  };
};

export const saveTursoCredentials = (credentials) => {
  try {
    localStorage.setItem(TURSO_CONFIG_KEY, JSON.stringify(credentials));
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

// Initialize database schema tables if connected
export const initTursoSchema = async () => {
  const client = getTursoClient();
  if (!client) return false;

  try {
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

    console.log('✅ Turso LibSQL database tables initialized successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error initializing Turso DB schema:', err);
    return false;
  }
};

// Test Connection
export const testTursoConnection = async (url, authToken) => {
  try {
    const tempClient = createClient({ url, authToken: authToken || undefined });
    await tempClient.execute('SELECT 1;');
    return { success: true, message: 'Koneksi ke Turso Database Berhasil!' };
  } catch (err) {
    return { success: false, message: err.message || 'Gagal terhubung ke Turso DB.' };
  }
};

// --- CRUD OPERATIONS FOR TURSO DATABASE ---

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

// 2. Site Config CRUD
export const fetchSiteConfigFromTurso = async () => {
  const client = getTursoClient();
  if (!client) return null;

  try {
    const res = await client.execute("SELECT config_json FROM site_config WHERE id = 'main';");
    if (res.rows.length > 0) {
      return JSON.parse(String(res.rows[0].config_json));
    }
  } catch (err) {
    console.error('Error fetching site config from Turso:', err);
  }
  return null;
};

export const saveSiteConfigToTurso = async (config) => {
  const client = getTursoClient();
  if (!client) return false;

  try {
    await client.execute({
      sql: `INSERT INTO site_config (id, config_json) VALUES ('main', ?)
            ON CONFLICT(id) DO UPDATE SET config_json=excluded.config_json;`,
      args: [JSON.stringify(config)]
    });
    return true;
  } catch (err) {
    console.error('Error saving site config to Turso:', err);
    return false;
  }
};

// 3. Products CRUD
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
