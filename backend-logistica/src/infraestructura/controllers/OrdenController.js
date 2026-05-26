const OrdenRepositoryMysql =
require('../repositories/OrdenRepositoryMysql');

const CrearOrden =
require('../../aplicacion/orden/CrearOrden');

const ObtenerOrdenes =
require('../../aplicacion/orden/ObtenerOrdenes');

const EditarOrden =
require('../../aplicacion/orden/EditarOrden');

const EliminarOrden =
require('../../aplicacion/orden/EliminarOrden');


const repository =
new OrdenRepositoryMysql();

const crearOrdenUseCase =
new CrearOrden(repository);

const obtenerOrdenesUseCase =
new ObtenerOrdenes(repository);

const editarOrdenUseCase =
new EditarOrden(repository);

const eliminarOrdenUseCase =
new EliminarOrden(repository);


class OrdenController {

  async crear(req, res) {

    try {

      const result =
      await crearOrdenUseCase.ejecutar(req.body);

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
      await obtenerOrdenesUseCase.ejecutar();

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
      await editarOrdenUseCase.ejecutar(
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
      await eliminarOrdenUseCase.ejecutar(
        req.params.id
      );

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

}

module.exports =
new OrdenController();