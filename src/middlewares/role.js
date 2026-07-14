const { auth } = require('./auth');
const { AppError } = require('../utils/appError');

const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }

    const rolesUsuario = req.user.roles || [];
    const tienePermiso = rolesPermitidos.some((rol) =>
      rolesUsuario.includes(rol)
    );

    if (!tienePermiso) {
      return next(new AppError('No tienes permiso para acceder', 403));
    }

    next();
  };
};

module.exports = { authorize };
