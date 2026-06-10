const db = require('../db');

const getVentasHoy = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.total, 
        v.fecha_venta AS fecha,
        COALESCE(SUM(vd.cantidad), 0) AS cantidad_total,
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'nombre', p.nombre,
              'cantidad', vd.cantidad,
              'precio_unitario', vd.precio_unitario
            )
          ), '[]'
        ) AS productos
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN venta_detalles vd ON v.id = vd.venta_id
      LEFT JOIN productos p ON vd.producto_id = p.id
      WHERE DATE(v.fecha_venta) = CURDATE()
      GROUP BY v.id, u.nombre, v.total, v.fecha_venta
      ORDER BY v.fecha_venta DESC
    `);

    // ✨ Convertimos el string de productos a un Array real de JavaScript
    const ventasParseadas = rows.map(venta => ({
      ...venta,
      productos: typeof venta.productos === 'string' ? JSON.parse(venta.productos) : venta.productos
    }));

    res.json(ventasParseadas);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
};

const getTodasVentas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.total, 
        v.fecha_venta AS fecha,
        COALESCE(SUM(vd.cantidad), 0) AS cantidad_total,
        IFNULL(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'nombre', p.nombre,
              'cantidad', vd.cantidad,
              'precio_unitario', vd.precio_unitario
            )
          ), '[]'
        ) AS productos
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN venta_detalles vd ON v.id = vd.venta_id
      LEFT JOIN productos p ON vd.producto_id = p.id
      GROUP BY v.id, u.nombre, v.total, v.fecha_venta
      ORDER BY v.fecha_venta DESC
    `);

    // ✨ Convertimos el string de productos a un Array real de JavaScript
    const ventasParseadas = rows.map(venta => ({
      ...venta,
      productos: typeof venta.productos === 'string' ? JSON.parse(venta.productos) : venta.productos
    }));

    res.json(ventasParseadas);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: err.message }); 
  }
};

module.exports = { getVentasHoy, getTodasVentas };