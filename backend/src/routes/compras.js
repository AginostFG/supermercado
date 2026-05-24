const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { cart, usuario_id, direccion, metodoPago } = req.body;
  
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  try {
    // 1. Calculamos el total de la venta
    const total = cart.reduce((sum, item) => sum + (Number(item.precio) * (item.cantidad || 1)), 0);

    // 2. Insertamos la venta guardando la dirección completa y el método de pago especificados por el cliente
    const [resultVenta] = await db.execute(
      'INSERT INTO ventas (usuario_id, trabajador_id, total, fecha_venta, direccion, metodo_pago) VALUES (?, NULL, ?, NOW(), ?, ?)',
      [usuario_id || null, total, direccion || 'No especificada', metodoPago || 'Pago Contra Entrega']
    );
    
    // Obtenemos el ID de la venta que acabamos de registrar
    const ventaId = resultVenta.insertId;

    // 3. Guardamos los detalles de cada producto y descontamos el stock del inventario
    for (let item of cart) {
      const cantidad = item.cantidad || 1;
      
      // Guardar en venta_detalles
      await db.execute(
        'INSERT INTO venta_detalles (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', 
        [ventaId, item.id, cantidad, item.precio]
      );
      
      // Descontar del inventario
      await db.execute(
        'UPDATE productos SET stock = stock - ? WHERE id = ?', 
        [cantidad, item.id]
      );
    }
    
    res.json({ mensaje: "Compra procesada con éxito y registrada en ventas" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;