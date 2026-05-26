const DetalleOrdenRepositoryMysql =
require('../repositories/DetalleOrdenRepositoryMysql');

const CrearDetalleOrden =
require('../../aplicacion/detalleOrden/CrearDetalleOrden');

const ObtenerDetalleOrden =
require('../../aplicacion/detalleOrden/ObtenerDetalleOrden');

const EliminarDetalleOrden =
require('../../aplicacion/detalleOrden/EliminarDetalleOrden');

const repository =
new DetalleOrdenRepositoryMysql();

const crearDetalleOrdenUseCase =
new CrearDetalleOrden(repository);

const obtenerDetalleOrdenUseCase =
new ObtenerDetalleOrden(repository);

const eliminarDetalleOrdenUseCase =
new EliminarDetalleOrden(repository);

class DetalleOrdenController {

  async crear(req, res) {

    try {

      const result =
      await crearDetalleOrdenUseCase.ejecutar(req.body);

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
      await obtenerDetalleOrdenUseCase.ejecutar();

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
      await eliminarDetalleOrdenUseCase.ejecutar(
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
new DetalleOrdenController();