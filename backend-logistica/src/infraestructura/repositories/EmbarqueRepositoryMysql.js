const Embarque =
require('../models/EmbarqueModel');

class EmbarqueRepositoryMysql {

  async crear(data) {

    return await Embarque.create(data);

  }

  async obtenerTodos() {

    return await Embarque.findAll();

  }

  async obtenerPorId(id) {

    return await Embarque.findByPk(id);

  }

  async editar(id, data) {

    await Embarque.update(
      data,
      {
        where: {
          id_embarque: id
        }
      }
    );

    return await this.obtenerPorId(id);

  }

  async eliminar(id) {

    return await Embarque.destroy({
      where: {
        id_embarque: id
      }
    });

  }

  async contar() {

  return await Embarque.count();

}

}

module.exports =
EmbarqueRepositoryMysql;