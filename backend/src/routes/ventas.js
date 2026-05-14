const express = require('express');
const router = express.Router();
const { getVentasHoy, getTodasVentas } = require('../controllers/ventasController');
const { soloAdmin } = require('../middleware/authMiddleware');

router.get('/ventas-hoy', soloAdmin, getVentasHoy);
router.get('/ventas', soloAdmin, getTodasVentas);

module.exports = router;