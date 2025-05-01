const express = require('express');
const cors = require('cors');
const { query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para log de consultas
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Ruta raíz mejorada
app.get('/', async (req, res) => {
  try {
    const { rows: [dbStatus] } = await query('SELECT NOW() AS current_time, version() AS db_version');
    res.json({
      status: 'Operativo',
      db: {
        time: dbStatus.current_time,
        version: dbStatus.db_version.split(' ').slice(0, 2).join(' ')
      },
      endpoints: {
        fondos: '/fondos',
        fondoById: '/fondos/:id'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

// Endpoint con paginación
app.get('/fondos', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { rows } = await query(`
      SELECT *, COUNT(*) OVER() AS total_count 
      FROM fondos 
      ORDER BY id 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json({
      data: rows.map(({ total_count, ...item }) => item),
      pagination: {
        total: rows[0]?.total_count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil((rows[0]?.total_count || 0) / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener fondos' });
  }
});

// Endpoint con filtros
app.get('/fondos/search', async (req, res) => {
  try {
    const { plataforma, fecha_desde, fecha_hasta } = req.query;
    let queryText = 'SELECT * FROM fondos WHERE 1=1';
    const params = [];
    
    if (plataforma) {
      params.push(plataforma);
      queryText += ` AND plataforma = $${params.length}`;
    }
    
    if (fecha_desde) {
      params.push(fecha_desde);
      queryText += ` AND fechainicio >= $${params.length}`;
    }
    