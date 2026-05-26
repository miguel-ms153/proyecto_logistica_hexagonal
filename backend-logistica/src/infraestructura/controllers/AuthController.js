const jwt =
require('jsonwebtoken');

const bcrypt =
require('bcryptjs');

const Usuario =
require('../models/UsuarioModel');

class AuthController {

  async login(req, res) {

    try {

      const {
        email,
        password
      } = req.body;

      const usuario =
        await Usuario.findOne({

          where: { email }

        });

      if (!usuario) {

        return res.status(404).json({

          error:
            'Usuario no encontrado'

        });

      }

      const valido =
        await bcrypt.compare(

          password,

          usuario.password

        );

      if (!valido) {

        return res.status(401).json({

          error:
            'Password incorrecta'

        });

      }

      const token =
        jwt.sign(

          {

            id:
              usuario.id_usuario,

            rol:
              usuario.rol

          },

          process.env.JWT_SECRET,

          {

            expiresIn: '8h'

          }

        );

      res.json({

        token,

        usuario

      });

    } catch (error) {

      res.status(500).json({

        error:
          error.message

      });

    }

  }

}

module.exports =
new AuthController();