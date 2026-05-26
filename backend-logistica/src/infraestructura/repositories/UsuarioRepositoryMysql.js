const Usuario =
require('../models/UsuarioModel');

class UsuarioRepositoryMysql {

  async crear(data) {

    return await Usuario.create(data);

  }

  async obtenerTodos() {

    return await Usuario.findAll();

  }

  async obtenerPorId(id) {

    return await Usuario.findByPk(id);

  }

  async obtenerPorEmail(email) {

    return await Usuario.findOne({
      where: { email }
    });

  }

  async editar(id, data) {

    await Usuario.update(
      data,
      {
        where: {
          id_usuario: id
        }
      }
    );

    return await this.obtenerPorId(id);

  }

  async eliminar(id) {

    return await Usuario.destroy({
      where: {
        id_usuario: id
      }
    });

  }
      async contar() {

  return await Usuario.count();

}


}

module.exports =
UsuarioRepositoryMysql;