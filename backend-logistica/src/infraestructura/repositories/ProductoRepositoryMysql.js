const Producto =
require('../models/ProductoModel');

class ProductoRepositoryMysql {

  async crear(data) {

    return await Producto.create(data);

  }

  async obtenerTodos() {

    return await Producto.findAll();

  }

  async obtenerPorId(id) {

    return await Producto.findByPk(id);

  }

  async editar(id, data) {

    await Producto.update(
      data,
      {
        where: {
          id_producto: id
        }
      }
    );

    return await this.obtenerPorId(id);

  }

  async eliminar(id) {

    return await Producto.destroy({
      where: {
        id_producto: id
      }
    });

  }
  async contar() {

  return await Producto.count();

}

}

module.exports =
ProductoRepositoryMysql;