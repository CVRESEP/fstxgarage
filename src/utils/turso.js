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
