const { Pool } = require('pg');

// Create a connection pool with explicit configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5430'),
  database: process.env.DB_NAME || 'recipe_db',
  user: process.env.DB_USER || 'recipe_user',
  password: process.env.DB_PASSWORD || 'recipe_password'
});

// Log connection info for debugging
console.log('Database connection info:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  // Don't log the password for security
});

module.exports = {
  pool,  // Export the pool directly so it can be used in transactions
  connect: async () => {
    try {
      const client = await pool.connect();
      console.log('Database connection successful!');
      client.release();
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  },
  query: (text, params) => pool.query(text, params)
};
