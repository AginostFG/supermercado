const db = require('../db');

const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createProducto = async (req, res) => {
  const { nombre, stock, precio, categoria_id, imagen_url } = req.body;
  if (!nombre || stock == null || precio == null || categoria_id == null)
    return res.status(400).json({ error: "Faltan campos requeridos (nombre, stock, precio, categoria_id)" });
  try {
    await db.execute(
      'INSERT INTO productos (nombre, stock, precio, categoria_id, imagen_url) VALUES (?, ?, ?, ?, ?)', 
      [nombre, stock, precio, categoria_id, imagen_url || null]
    );
    res.json({ mensaje: "Producto creado con éxito" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateProducto = async (req, res) => {
  const { nombre, stock, precio, categoria_id, imagen_url } = req.body;
  try {
    await db.execute(
      'UPDATE productos SET nombre = ?, stock = ?, precio = ?, categoria_id = ?, imagen_url = ? WHERE id = ?', 
      [nombre, stock, precio, categoria_id, imagen_url || null, req.params.id]
    );
    res.json({ mensaje: "Producto actualizado con éxito" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteProducto = async (req, res) => {
  try {
    await db.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Producto eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getProductos, createProducto, updateProducto, deleteProducto };