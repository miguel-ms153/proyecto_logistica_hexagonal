const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HistorialLogin =
require('../../infraestructura/models/HistorialLoginModel');

class LoginUsuario {

  constructor(repository) {

    this.repository = repository;

  }

  async ejecutar(email, password) {

    const user =
      await this.repository.obtenerPorEmail(email);

    if (!user) {

  await HistorialLogin.create({

    email,
    rol: 'SIN ROL',
    estado: 'USUARIO NO EXISTE'

  });

  throw new Error(
    'Usuario no existe'
  );

}

    const valid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!valid) {

  await HistorialLogin.create({

    id_usuario:
      user.id_usuario,

    email:
      user.email,

    rol:
      user.rol,

    estado:
      'FALLIDO'

  });

  throw new Error(
    'Password incorrecto'
  );

}

    const token = jwt.sign(

      {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol
      },

      process.env.JWT_SECRET,

      {
        expiresIn: '8h'
      }

    );

    // GUARDAR HISTORIAL LOGIN EXITOSO

    await HistorialLogin.create({

      id_usuario:
        user.id_usuario,

      email:
        user.email,

      rol:
        user.rol,

      estado:
        'EXITOSO'

    });

    return {

      token,

      usuario: {

        id:
          user.id_usuario,

        nombre:
          user.nombre,

        email:
          user.email,

        rol:
          user.rol

      }

    };

  }

}

module.exports = LoginUsuario;
