require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.listen(PORT);

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Santiago2219.',
  database: 'supermercado_mvp',
  port: '3306',
  waitForConnections: true,
  connectionLimit: 10
});

// --- USUARIOS ---
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, apellidos, correo, telefono, puntos FROM usuarios');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/usuarios/:id', async (req, res) => {
  const { nombre, puntos } = req.body;
  try {
    await db.execute('UPDATE usuarios SET nombre = ?, puntos = ? WHERE id = ?', [nombre, puntos, req.params.id]);
    res.json({ mensaje: "Usuario actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/usuarios/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PRODUCTOS ---
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/productos', async (req, res) => {
  const { nombre, stock, precio } = req.body;
  try {
    await db.execute('INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)', [nombre, stock, precio]);
    res.json({ mensaje: "Creado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/productos/:id', async (req, res) => {
  const { nombre, stock, precio } = req.body;
  try {
    await db.execute('UPDATE productos SET nombre = ?, stock = ?, precio = ? WHERE id = ?', [nombre, stock, precio, req.params.id]);
    res.json({ mensaje: "Producto actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/productos/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- VENTAS ---
app.get('/api/admin/ventas-hoy', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT v.id, u.nombre as cliente, v.total, v.fecha FROM ventas v JOIN usuarios u ON v.usuario_id = u.id WHERE DATE(v.fecha) = CURDATE()`);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  
  try {
    // Buscamos al usuario por correo
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    // Verificamos la contraseña (aquí asumo que es texto plano por ser un MVP escolar)
    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Si todo está bien, enviamos los datos del usuario
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol // Asegúrate de tener esta columna en tu DB si manejas admin/cliente
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(3000, () => console.log('🚀 Backend en puerto 3000'));