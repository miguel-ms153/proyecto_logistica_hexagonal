const UsuarioRepositoryMysql =
require('../repositories/UsuarioRepositoryMysql');

const CrearUsuario =
require('../../aplicacion/usuario/CrearUsuario');

const ObtenerUsuarios =
require('../../aplicacion/usuario/ObtenerUsuarios');

const EditarUsuario =
require('../../aplicacion/usuario/EditarUsuario');

const EliminarUsuario =
require('../../aplicacion/usuario/EliminarUsuario');

const LoginUsuario =
require('../../aplicacion/usuario/LoginUsuario');

const repository =
new UsuarioRepositoryMysql();

const crearUsuarioUseCase =
new CrearUsuario(repository);

const obtenerUsuariosUseCase =
new ObtenerUsuarios(repository);

const editarUsuarioUseCase =
new EditarUsuario(repository);

const eliminarUsuarioUseCase =
new EliminarUsuario(repository);

const loginUsuarioUseCase =
new LoginUsuario(repository);

class UsuarioController {

  async crear(req, res) {

    try {

      const result =
      await crearUsuarioUseCase.ejecutar(req.body);

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async obtener(req, res) {

    try {

      const result =
      await obtenerUsuariosUseCase.ejecutar();

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async editar(req, res) {

    try {

      const result =
      await editarUsuarioUseCase.ejecutar(
        req.params.id,
        req.body
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async eliminar(req, res) {

    try {

      const result =
      await eliminarUsuarioUseCase.ejecutar(
        req.params.id
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

  async login(req, res) {

    try {

      const result =
      await loginUsuarioUseCase.ejecutar(
        req.body.email,
        req.body.password
      );

      res.json(result);

    } catch (error) {

      res.status(401).json({
        error: error.message
      });

    }

  }

}

module.exports = new UsuarioController();