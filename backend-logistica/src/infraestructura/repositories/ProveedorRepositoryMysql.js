const Proveedor =
require('../models/ProveedorModel');

class ProveedorRepositoryMysql {

  async crear(data) {

    return await Proveedor.create(data);

  }

  async obtenerTodos() {

    return await Proveedor.findAll();

  }

  async editar(id, data) {

    await Proveedor.update(
      data,
      {
        where: {
          id_proveedor: id
        }
      }
    );

    return await Proveedor.findByPk(id);

  }

  async eliminar(id) {

    return await Proveedor.destroy({
      where: {
        id_proveedor: id
      }
    });

  }

}

module.exports =
ProveedorRepositoryMysql;