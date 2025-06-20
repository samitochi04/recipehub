const { Pool } = require('pg');

// Check if we're running in Firebase Functions (more reliable detection)
const isFirebaseFunctions = !!(process.env.FUNCTION_TARGET || process.env.FUNCTION_NAME || process.env.K_SERVICE);

console.log('Environment check:', {
  FUNCTION_TARGET: process.env.FUNCTION_TARGET,
  FUNCTION_NAME: process.env.FUNCTION_NAME,
  K_SERVICE: process.env.K_SERVICE,
  isFirebaseFunctions: isFirebaseFunctions
});

// Database configuration
let dbConfig;

if (isFirebaseFunctions) {
  // In Firebase Functions, clean the host URL
  let host = process.env.DB_HOST || '';
  host = host.replace('https://', '').replace('http://', '');
  
  dbConfig = {
    host: host,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: { rejectUnauthorized: false }, // Always use SSL for Supabase
    max: 5, // Reduced pool size for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // Local development
  require('dotenv').config();
  let host = process.env.DB_HOST || 'localhost';
  host = host.replace('https://', '').replace('http://', '');
  
  dbConfig = {
    host: host,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'recipe_db',
    user: process.env.DB_USER || 'recipe_user',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

console.log('Database connection info:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl,
  isFirebaseFunctions: !!isFirebaseFunctions
});

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('✅ Connected to database successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test connection on startup
pool.query('SELECT NOW() as current_time')
  .then(result => {
    console.log('✅ Database test query successful:', result.rows[0]);
  })
  .catch(err => {
    console.error('❌ Database test query failed:', err.message);
  });

// Export both pool and a query method
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};

