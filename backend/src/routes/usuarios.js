const express = require('express');
const router = express.Router();
const { getUsuarios, updateUsuario, deleteUsuario } = require('../controllers/usuariosController');
const { soloAdmin } = require('../middleware/authMiddleware');

router.get('/', soloAdmin, getUsuarios);
router.put('/:id', soloAdmin, updateUsuario);
router.delete('/:id', soloAdmin, deleteUsuario);

module.exports = router;