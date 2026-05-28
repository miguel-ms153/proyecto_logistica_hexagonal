const Bitacora =
require('../models/BitacoraModel');

class BitacoraRepositoryMysql {

  async obtenerTodos() {

    return await Bitacora.findAll({
      order: [
        ['id_bitacora', 'DESC']
      ],
      limit: 500
    });

  }

  async crear(data) {

    return await Bitacora.create(data);

  }

  async contar() {

    return await Bitacora.count();

  }

}

module.exports =
BitacoraRepositoryMysql;
