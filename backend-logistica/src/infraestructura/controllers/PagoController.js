const PagoRepositoryMysql =
require('../repositories/PagoRepositoryMysql');

const CrearPago =
require('../../aplicacion/pago/CrearPago');

const ObtenerPagos =
require('../../aplicacion/pago/ObtenerPagos');

const EditarPago =
require('../../aplicacion/pago/EditarPago');

const EliminarPago =
require('../../aplicacion/pago/EliminarPago');

const repository =
new PagoRepositoryMysql();

const crearPagoUseCase =
new CrearPago(repository);

const obtenerPagosUseCase =
new ObtenerPagos(repository);

const editarPagoUseCase =
new EditarPago(repository);

const eliminarPagoUseCase =
new EliminarPago(repository);

class PagoController {

  async crear(req, res) {

    try {

      const result =
      await crearPagoUseCase.ejecutar(
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
      await obtenerPagosUseCase.ejecutar();

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
      await editarPagoUseCase.ejecutar(
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
      await eliminarPagoUseCase.ejecutar(
        req.params.id
      );

      res.json({
        mensaje: 'Pago eliminado',
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
new PagoController();