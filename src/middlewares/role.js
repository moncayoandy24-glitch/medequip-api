const { auth } = require('./auth');

const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const rolesUsuario = req.user.roles || [];
    const tienePermiso = rolesPermitidos.some((rol) =>
      rolesUsuario.includes(rol)
    );

    if (!tienePermiso) {
      return res.status(403).json({ message: 'No tienes permiso para acceder' });
    }

    next();
  };
};

module.exports = { authorize };
