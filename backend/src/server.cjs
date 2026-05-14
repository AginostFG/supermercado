require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/admin/usuarios', require('./routes/usuarios'));
app.use('/api/admin/productos', require('./routes/productos'));
app.use('/api/admin', require('./routes/ventas'));

// Health check
app.get('/', (req, res) => res.json({ status: '🚀 Backend corriendo' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));