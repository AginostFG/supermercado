const express = require('express');
const router = express.Router();
const db = require('../db');

// Ruta pública para que el cliente procese su compra y descuente stock
router.post('/', async (req, res) => {
  const { cart } = req.body;
  
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  try {
    // Recorremos el carrito y descontamos el stock de cada producto
    for (let item of cart) {
      await db.execute(
        'UPDATE productos SET stock = stock - ? WHERE id = ?', 
        [item.cantidad || 1, item.id]
      );
    }
    
    res.json({ mensaje: "Compra procesada y stock actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;