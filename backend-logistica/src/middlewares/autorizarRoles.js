const autorizarRoles =
(...rolesPermitidos) => {

  return (req, res, next) => {

    const rol =
      req.usuario?.rol;

    if (!rol) {

      return res.status(401).json({
        error: 'Usuario no autenticado'
      });

    }

    if (!rolesPermitidos.includes(rol)) {

      return res.status(403).json({
        error: 'No tienes permisos para realizar esta accion'
      });

    }

    next();

  };

};

module.exports =
autorizarRoles;
