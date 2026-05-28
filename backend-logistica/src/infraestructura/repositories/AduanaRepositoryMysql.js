const Aduana =
require('../models/AduanaModel');

const Orden =
require('../models/OrdenModel');

class AduanaRepositoryMysql {

  async crear(data) {

    return await Aduana.create(data);

  }

  async obtenerTodos() {

    return await Aduana.findAll({
      include: [
        {
          model: Orden,
          as: 'orden'
        }
      ],
      order: [
        ['id_aduana', 'DESC']
      ]
    });

  }

  async obtenerPorId(id) {

    return await Aduana.findByPk(
      id,
      {
        include: [
          {
            model: Orden,
            as: 'orden'
          }
        ]
      }
    );

  }

  async editar(id, data) {

    await Aduana.update(
      data,
      {
        where: {
          id_aduana: id
        }
      }
    );

    return await this.obtenerPorId(id);

  }

  async eliminar(id) {

    return await Aduana.destroy({
      where: {
        id_aduana: id
      }
    });

  }

  async contar() {

    return await Aduana.count();

  }

}

module.exports =
AduanaRepositoryMysql;
