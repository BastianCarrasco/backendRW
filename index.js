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

// Crear un nuevo fondo
app.post('/fondos', async (req, res) => {
  try {
    const { nombre, url, fechainicio, plataforma, fechacierre } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO fondos (nombre, url, fechainicio, plataforma, fechacierre, contador) VALUES ($1, $2, $3, $4, $5, 0) RETURNING *',
      [nombre, url, fechainicio, plataforma, fechacierre]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el fondo' });
  }
});

// Actualizar un fondo existente
app.put('/fondos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, url, fechainicio, plataforma, fechacierre } = req.body;
    const { rows } = await pool.query(
      'UPDATE fondos SET nombre = $1, url = $2, fechainicio = $3, plataforma = $4, fechacierre = $5 WHERE id = $6 RETURNING *',
      [nombre, url, fechainicio, plataforma, fechacierre, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fondo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el fondo' });
  }
});

// Incrementar el contador de un fondo
app.patch('/fondos/:id/incrementar', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'UPDATE fondos SET contador = contador + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Fondo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al incrementar el contador' });
  }
});

// Eliminar un fondo
app.delete('/fondos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM fondos WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Fondo no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar el fondo' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});