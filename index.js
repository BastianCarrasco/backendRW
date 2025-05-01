const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend conectado a PostgreSQL</h1>
    <ul>
      <li><a href="/fondos">Ver todos los fondos</a></li>
      <li><a href="/fondos/1">Ver fondo con ID 1</a></li>
    </ul>
  `);
});

// Obtener todos los fondos
app.get('/fondos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fondos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener fondos' });
  }
});

// Obtener un fondo específico
app.get('/fondos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM fondos WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fondo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el fondo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});