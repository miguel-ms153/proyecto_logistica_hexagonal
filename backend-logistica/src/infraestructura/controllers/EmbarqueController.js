const EmbarqueRepositoryMysql =
require('../repositories/EmbarqueRepositoryMysql');

const CrearEmbarque =
require('../../aplicacion/embarque/CrearEmbarque');

const ObtenerEmbarques =
require('../../aplicacion/embarque/ObtenerEmbarques');

const EditarEmbarque =
require('../../aplicacion/embarque/EditarEmbarque');

const EliminarEmbarque =
require('../../aplicacion/embarque/EliminarEmbarque');

const repository =
new EmbarqueRepositoryMysql();

const crearEmbarqueUseCase =
new CrearEmbarque(repository);

const obtenerEmbarquesUseCase =
new ObtenerEmbarques(repository);

const editarEmbarqueUseCase =
new EditarEmbarque(repository);

const eliminarEmbarqueUseCase =
new EliminarEmbarque(repository);

class EmbarqueController {

  async crear(req, res) {

    try {

      const result =
      await crearEmbarqueUseCase.ejecutar(req.body);

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
      await obtenerEmbarquesUseCase.ejecutar();

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
      await editarEmbarqueUseCase.ejecutar(
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
      await eliminarEmbarqueUseCase.ejecutar(
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
new EmbarqueController();