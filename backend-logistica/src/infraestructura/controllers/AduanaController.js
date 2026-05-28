const AduanaRepositoryMysql =
require('../repositories/AduanaRepositoryMysql');

const CrearAduana =
require('../../aplicacion/aduana/CrearAduana');

const ObtenerAduanas =
require('../../aplicacion/aduana/ObtenerAduanas');

const EditarAduana =
require('../../aplicacion/aduana/EditarAduana');

const EliminarAduana =
require('../../aplicacion/aduana/EliminarAduana');

const repository =
new AduanaRepositoryMysql();

const crearAduanaUseCase =
new CrearAduana(repository);

const obtenerAduanasUseCase =
new ObtenerAduanas(repository);

const editarAduanaUseCase =
new EditarAduana(repository);

const eliminarAduanaUseCase =
new EliminarAduana(repository);

class AduanaController {

  async crear(req, res) {

    try {

      const result =
      await crearAduanaUseCase.ejecutar(req.body);

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
      await obtenerAduanasUseCase.ejecutar();

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
      await editarAduanaUseCase.ejecutar(
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
      await eliminarAduanaUseCase.ejecutar(
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
new AduanaController();
