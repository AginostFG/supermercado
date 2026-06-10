const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta: /api/admin/ventas (Para el Dashboard Admin)
router.get('/ventas', async (req, res) => {
  const periodo = req.query.periodo || 'diario';
  let filtroFecha = '';

  if (periodo === 'diario') {
    filtroFecha = 'DATE(v.fecha_venta) = CURDATE()';
  } else if (periodo === 'semanal') {
    filtroFecha = 'YEARWEEK(v.fecha_venta, 1) = YEARWEEK(CURDATE(), 1)';
  } else if (periodo === 'mensual') {
    filtroFecha = 'MONTH(v.fecha_venta) = MONTH(CURDATE()) AND YEAR(v.fecha_venta) = YEAR(CURDATE())';
  } else if (periodo === 'anual') {
    filtroFecha = 'YEAR(v.fecha_venta) = YEAR(CURDATE())';
  }

  try {
    const query = `
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.fecha_venta AS fecha, 
        v.total,
        v.direccion,
        v.metodo_pago,
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
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN venta_detalles vd ON v.id = vd.venta_id
      LEFT JOIN productos p ON vd.producto_id = p.id
      ${filtroFecha ? `WHERE ${filtroFecha}` : ''}
      GROUP BY v.id, u.nombre, v.fecha_venta, v.total, v.direccion, v.metodo_pago
      ORDER BY v.fecha_venta DESC
    `;
    
    const [rows] = await db.query(query);

    // ✨ Parseamos los productos de String a Array Real antes de responder a React
    const ventasParseadas = rows.map(venta => ({
      ...venta,
      productos: typeof venta.productos === 'string' ? JSON.parse(venta.productos) : venta.productos
    }));

    res.json(ventasParseadas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// NUEVA RUTA: Para obtener el historial de compras de un cliente específico en su perfil
router.get('/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        v.id AS orden_id, 
        v.fecha_venta, 
        v.total, 
        v.direccion, 
        v.metodo_pago
      FROM ventas v
      WHERE v.usuario_id = ?
      ORDER BY v.fecha_venta DESC
    `;
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;