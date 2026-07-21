const { Pool } = require('pg');

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'medequip',
    };

const pool = new Pool({
  ...connection,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 5000),
  ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
});

module.exports = pool;
