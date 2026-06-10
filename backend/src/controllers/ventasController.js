const db = require('../db');

const getVentasHoy = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.total, 
        v.fecha,
        COALESCE(SUM(dv.cantidad), 0) AS cantidad_total,
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'nombre', p.nombre,
              'cantidad', dv.cantidad,
              'precio_unitario', dv.precio_unitario
            )
          ), '[]'
        ) AS productos
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
      LEFT JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha) = CURDATE()
      GROUP BY v.id, u.nombre, v.total, v.fecha
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getTodasVentas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.total, 
        v.fecha,
        COALESCE(SUM(dv.cantidad), 0) AS cantidad_total,
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'nombre', p.nombre,
              'cantidad', dv.cantidad,
              'precio_unitario', dv.precio_unitario
            )
          ), '[]'
        ) AS productos
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN detalles_venta dv ON v.id = dv.venta_id
      LEFT JOIN productos p ON dv.producto_id = p.id
      GROUP BY v.id, u.nombre, v.total, v.fecha
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getVentasHoy, getTodasVentas };