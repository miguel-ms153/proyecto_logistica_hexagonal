const BitacoraRepositoryMysql =
require('../repositories/BitacoraRepositoryMysql');

const ObtenerBitacora =
require('../../aplicacion/bitacora/ObtenerBitacora');

const repository =
new BitacoraRepositoryMysql();

const obtenerBitacoraUseCase =
new ObtenerBitacora(repository);

class BitacoraController {

  async obtener(req, res) {

    try {

      const result =
      await obtenerBitacoraUseCase.ejecutar();

      res.json(result);

    } catch (error) {

      res.status(500).json({
        error: error.message
      });

    }

  }

}

module.exports =
new BitacoraController();
