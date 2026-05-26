const DetalleOrden = require('../models/DetalleOrdenModel');
const Producto = require('../models/ProductoModel');

class DetalleOrdenRepositoryMysql {
  async crear(data) {
    return await DetalleOrden.create(data);
  }

  async obtenerPorOrden(idOrden) {
    return await DetalleOrden.findAll({
      where: {
        id_orden: idOrden
      },
      include: [
        {
          model: Producto,
          as: 'producto'
        }
      ]
    });
  }

  async eliminar(id) {
    return await DetalleOrden.destroy({
      where: {
        id_detalle: id
      }
    });
  }
}

module.exports = DetalleOrdenRepositoryMysql;