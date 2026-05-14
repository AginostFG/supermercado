// Middleware para proteger rutas de admin
// Por ahora verifica un header simple; puedes mejorar con JWT después

const soloAdmin = (req, res, next) => {
  const rol = req.headers['x-rol'];

  if (rol !== 'admin') {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  }

  next();
};

module.exports = { soloAdmin };