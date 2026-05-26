const Pago = require('../models/PagoModel');

class PagoRepositoryMysql {
  async crear(data) {
    return await Pago.create(data);
  }

  async obtenerTodos() {
    return await Pago.findAll();
  }

  async obtenerPorId(id) {
    return await Pago.findByPk(id);
  }

  async editar(id, data) {
    const [filasActualizadas] = await Pago.update(data, {
      where: {
        id_pago: id
      }
    });

    if (filasActualizadas === 0) {
      return null;
    }

    return await this.obtenerPorId(id);
  }

  async eliminar(id) {
    return await Pago.destroy({
      where: {
        id_pago: id
      }
    });
  }
}

module.exports = PagoRepositoryMysql;