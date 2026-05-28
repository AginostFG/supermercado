const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta: /api/admin/ventas (Para el Dashboard Admin)
router.get('/ventas', async (req, res) => {
  const periodo = req.query.periodo || 'diario';
  let filtroFecha = '';

  // Filtros dinámicos de fechas
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
    // Agregadas las columnas v.direccion y v.metodo_pago para reflejar los datos de entrega en el dashboard admin
    const query = `
      SELECT 
        v.id, 
        u.nombre AS cliente_nombre, 
        v.fecha_venta AS fecha, 
        v.total,
        v.direccion,
        v.metodo_pago,
        (SELECT SUM(cantidad) FROM venta_detalles WHERE venta_id = v.id) AS cantidad_total
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ${filtroFecha ? `WHERE ${filtroFecha}` : ''}
      ORDER BY v.fecha_venta DESC
    `;
    
    const [rows] = await db.query(query);
    res.json(rows);
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
        v.metodo_pago,
        (SELECT SUM(cantidad) FROM venta_detalles WHERE venta_id = v.id) AS cantidad_productos
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