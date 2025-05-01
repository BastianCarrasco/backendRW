const { Pool } = require('pg');
require('dotenv').config();

// Conexión usando DATABASE_URL (opción preferida)
const connectionConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
      ssl: { rejectUnauthorized: false }
    };

const pool = new Pool(connectionConfig);

// Verificador de conexión mejorado
pool.on('connect', () => console.log('Conexión a PostgreSQL establecida'));
pool.on('error', (err) => console.error('Error inesperado en la pool:', err));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};