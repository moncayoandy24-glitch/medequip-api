const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado', errors: [] });
    }

    const rolesUsuario = req.user.roles || [];
    const tienePermiso = rolesPermitidos.some((rol) =>
      rolesUsuario.includes(rol)
    );

    if (!tienePermiso) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para acceder', errors: [] });
    }

    next();
  };
};

module.exports = { authorize };
