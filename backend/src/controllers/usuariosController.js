const db = require('../db');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, apellidos, correo, telefono, puntos FROM usuarios');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateUsuario = async (req, res) => {
  const { nombre, puntos } = req.body;
  try {
    await db.execute('UPDATE usuarios SET nombre = ?, puntos = ? WHERE id = ?', [nombre, puntos, req.params.id]);
    res.json({ mensaje: "Usuario actualizado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteUsuario = async (req, res) => {
  try {
    await db.execute('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { getUsuarios, updateUsuario, deleteUsuario };