const { DataTypes } = require('sequelize');

const sequelize =
require('../database/mysql');

const DetalleOrden = sequelize.define(
  'detalle_orden',
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    cantidad: {
      type: DataTypes.INTEGER
    },

    subtotal: {
      type: DataTypes.FLOAT
    },

    id_orden: {
      type: DataTypes.INTEGER
    },

    id_producto: {
      type: DataTypes.INTEGER
    }
  },
  {
    timestamps: false
  }
);

module.exports = DetalleOrden;