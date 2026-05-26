const Orden = require('../models/OrdenModel');
const Usuario = require('../models/UsuarioModel');
const Producto = require('../models/ProductoModel');
const Embarque = require('../models/EmbarqueModel');
const Pago = require('../models/PagoModel');

class OrdenRepositoryMysql {
  async crear(data) {
    return await Orden.create(data);
  }

  async obtenerTodos() {
    return await Orden.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'email', 'rol']
        },
        {
          model: Producto,
          as: 'productos'
        },
        {
          model: Embarque,
          as: 'embarques'
        },
        {
          model: Pago,
          as: 'pagos'
        }
      ]
    });
  }

  async obtenerPorId(id) {
    return await Orden.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'email', 'rol']
        },
        {
          model: Producto,
          as: 'productos'
        },
        {
          model: Embarque,
          as: 'embarques'
        },
        {
          model: Pago,
          as: 'pagos'
        }
      ]
    });
  }

  async editar(id, data) {
    const [filasActualizadas] = await Orden.update(data, {
      where: {
        id_orden: id
      }
    });

    if (filasActualizadas === 0) {
      return null;
    }

    return await this.obtenerPorId(id);
  }

  async eliminar(id) {
    return await Orden.destroy({
      where: {
        id_orden: id
      }
    });
  }

  async contar() {
    return await Orden.count();
  }
}

module.exports = OrdenRepositoryMysql;