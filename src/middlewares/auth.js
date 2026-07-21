const jwt = require('jsonwebtoken');
const { usuarioRepository } = require('../repositories/usuarioRepository');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionado', errors: [] });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado', errors: [] });
  }

  try {
    const usuario = await usuarioRepository.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ success: false, message: 'Usuario no disponible', errors: [] });
    }
    req.user = { id: usuario.id, email: usuario.email, roles: usuario.roles };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { auth };
