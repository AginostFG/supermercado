const express = require('express');
const router = express.Router();
const db = require('../db');
const { soloAdmin } = require('../middleware/authMiddleware');

// 1. Obtener todas las categorías (Público, necesario para el select)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Crear categoría (Solo Admin)
router.post('/', soloAdmin, async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    await db.execute('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.json({ mensaje: "Categoría creada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Editar categoría (Solo Admin)
router.put('/:id', soloAdmin, async (req, res) => {
  const { nombre } = req.body;
  try {
    await db.execute('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, req.params.id]);
    res.json({ mensaje: "Categoría actualizada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Eliminar categoría (Solo Admin)
router.delete('/:id', soloAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;