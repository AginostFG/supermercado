const db = require('../db');

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena)
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (rows.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const usuario = rows[0];

    if (usuario.password !== contrasena)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    // ✅ Devuelve rol_id numérico (1 = cliente, 2 = admin)
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol_id: usuario.rol_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const registro = async (req, res) => {
  const { nombre, apellidos, correo, password, sexo, fechaNacimiento, telefono } = req.body;

  if (!nombre || !apellidos || !correo || !password || !sexo || !fechaNacimiento || !telefono)
    return res.status(400).json({ error: "Todos los campos son requeridos" });

  try {
    const [existe] = await db.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);

    if (existe.length > 0)
      return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });

    const [result] = await db.execute(
      `INSERT INTO usuarios (nombre, apellidos, correo, password, sexo, fecha_nacimiento, telefono, puntos, rol_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)`,
      [nombre, apellidos, correo, password, sexo, fechaNacimiento, telefono]
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      id: result.insertId,
      nombre,
      rol_id: 1
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { login, registro };