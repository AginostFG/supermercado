const express = require('express');
const router = express.Router();
const { getProductos, createProducto, updateProducto, deleteProducto } = require('../controllers/productosController');
const { soloAdmin } = require('../middleware/authMiddleware');

// Público
router.get('/', getProductos);

// Solo admin
router.post('/', soloAdmin, createProducto);
router.put('/:id', soloAdmin, updateProducto);
router.delete('/:id', soloAdmin, deleteProducto);

module.exports = router;