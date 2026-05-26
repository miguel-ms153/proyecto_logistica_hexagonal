const ProveedorRepositoryMysql =
require('../repositories/ProveedorRepositoryMysql');

const CrearProveedor =
require('../../aplicacion/proveedor/CrearProveedor');

const ObtenerProveedores =
require('../../aplicacion/proveedor/ObtenerProveedores');

const EditarProveedor =
require('../../aplicacion/proveedor/EditarProveedor');

const EliminarProveedor =
require('../../aplicacion/proveedor/EliminarProveedor');

const repository =
new ProveedorRepositoryMysql();

const crearProveedorUseCase =
new CrearProveedor(repository);

const obtenerProveedoresUseCase =
new ObtenerProveedores(repository);

const editarProveedorUseCase =
new EditarProveedor(repository);

const eliminarProveedorUseCase =
new EliminarProveedor(repository);

class ProveedorController {

  async crear(req, res) {

    try {

      const result =
      await crearProveedorUseCase.ejecutar(
        req.body
      );

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
      await obtenerProveedoresUseCase.ejecutar();

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
      await editarProveedorUseCase.ejecutar(
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
      await eliminarProveedorUseCase.ejecutar(
        req.params.id
      );

      res.json({
        mensaje: 'Proveedor eliminado',
        result
      });

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

}

module.exports =
new ProveedorController();