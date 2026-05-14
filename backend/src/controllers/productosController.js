const db = require('../db');

const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createProducto = async (req, res) => {
  const { nombre, stock, precio } = req.body;
  if (!nombre || stock == null || precio == null)
    return res.status(400).json({ error: "Faltan campos requeridos" });
  try {
    await db.execute('INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)', [nombre, stock, precio]);
    res.json({ mensaje: "Producto creado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateProducto = async (req, res) => {
  const { nombre, stock, precio } = req.body;
  try {
    await db.execute('UPDATE productos SET nombre = ?, stock = ?, precio = ? WHERE id = ?', [nombre, stock, precio, req.params.id]);
    res.json({ mensaje: "Producto actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteProducto = async (req, res) => {
  try {
    await db.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Producto eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };