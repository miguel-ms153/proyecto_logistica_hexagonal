const Documento =
require('../models/DocumentoModel');

const Orden =
require('../models/OrdenModel');

const Aduana =
require('../models/AduanaModel');

class DocumentoRepositoryMysql {

  async crear(data) {

    return await Documento.create(data);

  }

  async obtenerTodos() {

    return await Documento.findAll({
      include: [
        {
          model: Orden,
          as: 'orden'
        },
        {
          model: Aduana,
          as: 'aduana'
        }
      ],
      order: [
        ['id_documento', 'DESC']
      ]
    });

  }

  async obtenerPorId(id) {

    return await Documento.findByPk(
      id,
      {
        include: [
          {
            model: Orden,
            as: 'orden'
          },
          {
            model: Aduana,
            as: 'aduana'
          }
        ]
      }
    );

  }

  async editar(id, data) {

    await Documento.update(
      data,
      {
        where: {
          id_documento: id
        }
      }
    );

    return await this.obtenerPorId(id);

  }

  async eliminar(id) {

    return await Documento.destroy({
      where: {
        id_documento: id
      }
    });

  }

  async contar() {

    return await Documento.count();

  }

}

module.exports =
DocumentoRepositoryMysql;
