const db = require('../db');

const getVentasHoy = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.id, u.nombre AS cliente, v.total, v.fecha, v.productos, v.direccion, v.metodo_pago, v.cantidad_total
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      WHERE DATE(v.fecha) = CURDATE()
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTodasVentas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.id, u.nombre AS cliente, v.total, v.fecha, v.productos, v.direccion, v.metodo_pago, v.cantidad_total
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getVentasHoy, getTodasVentas };