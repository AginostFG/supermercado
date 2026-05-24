require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==================== RUTAS PÚBLICAS / CLIENTES ====================
app.use('/api', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));

// ==================== RUTAS DE ADMINISTRACIÓN ====================
// (Se colocan primero las rutas más específicas)
app.use('/api/admin/usuarios', require('./routes/usuarios'));
app.use('/api/admin/productos', require('./routes/productos'));
app.use('/api/admin/categorias', require('./routes/categorias'));

// (Al final del bloque de administración se coloca la ruta base / general)
app.use('/api/admin', require('./routes/ventas')); 

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => res.json({ status: '🚀 Backend corriendo con éxito' }));

// ==================== ARRANCAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor encendido en el puerto ${PORT}`));