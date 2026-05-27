const DetalleOrden = require('../models/DetalleOrdenModel');
const Producto = require('../models/ProductoModel');
const sequelize = require('../database/mysql');

class DetalleOrdenRepositoryMysql {
  async crear(data) {
    const cantidad = Number(data.cantidad || 0);
    const idProducto = data.id_producto;

    if (!idProducto) {
      throw new Error('Debe seleccionar un producto');
    }

    if (!cantidad || cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero');
    }

    return await sequelize.transaction(async (transaction) => {
      const producto = await Producto.findByPk(idProducto, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (Number(producto.stock) < cantidad) {
        throw new Error(
          `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
        );
      }

      const subtotal =
        data.subtotal !== undefined
          ? Number(data.subtotal)
          : Number(producto.precio) * cantidad;

      const detalle = await DetalleOrden.create(
        {
          ...data,
          cantidad,
          subtotal
        },
        { transaction }
      );

      await producto.update(
        {
          stock: Number(producto.stock) - cantidad
        },
        { transaction }
      );

      return detalle;
    });
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
    return await sequelize.transaction(async (transaction) => {
      const detalle = await DetalleOrden.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!detalle) {
        return 0;
      }

      const producto = await Producto.findByPk(detalle.id_producto, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (producto) {
        await producto.update(
          {
            stock: Number(producto.stock) + Number(detalle.cantidad || 0)
          },
          { transaction }
        );
      }

      return await DetalleOrden.destroy({
        where: {
          id_detalle: id
        },
        transaction
      });
    });
  }
}

module.exports = DetalleOrdenRepositoryMysql;
